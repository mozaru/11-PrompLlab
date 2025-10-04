import { interpolatePlaceholders } from '../../lib/interpolatePlaceholders';
import { backoff } from '../../lib/retry/backoff';
import { safeEval } from '../../lib/safeEval';
import type { AgentTool } from '../../types/chat';

type RoleMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; name?: string, tool_call_id?:string };

export type OpenAIChatParams = {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
};


export async function openaiChat(
  params: OpenAIChatParams,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const url = `${params.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;

  const body = {
    model: params.model,
    messages,
    temperature: params.temperature ?? 0.2,
    max_tokens: params.maxTokens ?? 2000,
  };

  const attempt = async () => {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}`);
    const data = await r.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    return text;
  };

  // 10 tentativas com backoff exponencial + jitter (já temos util no projeto)
  return backoff(attempt, { retries: 10, baseMs: 500, factor: 2, jitterMs: 250, maxMs: 30000 });
}


function convertToOpenAITool(tool: AgentTool) {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters,
        required: Object.keys(tool.parameters)
      }
    }
  };
}

export async function executeTool(params: OpenAIChatParams, tool: AgentTool, args: Record<string, any>): Promise<string> {
  switch (tool.type) {
    case 'regex': {
      const regexStr = interpolatePlaceholders(tool.regexTemplate, args);
      const re = new RegExp(regexStr, `g`+tool.flags?.join(""));
      const matches = tool.baseText.matchAll(re).toArray();
      const group = tool.group!=null ? parseInt("0"+tool.group) : 0;
      const match = matches.length>0 && matches[0].length>group?matches[0][group] : '';
      return match || tool.defaultValue || '';
    }
    case 'prompt': {
      const userPrompt = interpolatePlaceholders(tool.promptTemplate, args);
      const systemPrompt = interpolatePlaceholders(tool.systemPrompt??'', args) ?? 'Você é um agente auxiliar.';
      const result = await openaiChat(params, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
      return result;
    }
    case 'function': {
      try {
        const result = await safeEval(tool.functionCode, args);
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (e) {
        return `[Erro na execução da função]: ${(e as Error).message}`;
      }
    }
  }
}

export async function openaiChatWithAgent(
  params: OpenAIChatParams,
  messages: RoleMessage[],
  tools: AgentTool[]
): Promise<string> {
  const toolMap = new Map(tools.map(t => [t.name, t]));
  const openAITools = tools.map(convertToOpenAITool);
  console.log(openAITools);
  console.log(JSON.stringify(openAITools));
  let loopCount = 0;

  while (loopCount++ < 5) {
    // monta body para chamada com tools
    const url = `${params.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
    const body = {
      model: params.model,
      messages,
      temperature: params.temperature ?? 0.2,
      max_tokens: params.maxTokens ?? 2000,
      tools: openAITools,
      tool_choice: 'auto',
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) throw new Error(`OpenAI HTTP ${r.status}`);
    const data = await r.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    if (!message) throw new Error('Resposta da OpenAI inválida');

    // se a LLM quiser chamar uma tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      // adiciona mensagem da LLM que gerou as tool_calls
      messages.push({
        role: 'assistant',
        content: null,
        ...message,
      });

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolCallId = toolCall.id;
        const toolArgs = JSON.parse(toolCall.function.arguments ?? '{}');

        const agentTool = toolMap.get(toolName);
        if (!agentTool) {
          throw new Error(`Tool '${toolName}' não encontrada`);
        }

        const toolResponse = await executeTool(params, agentTool, toolArgs);

        // adiciona resposta da tool
        messages.push({
          role: 'tool',
          tool_call_id: toolCallId,
          content: toolResponse,
        });
      }

      
    } else {
      // resposta final (sem chamar tools)
      return message.content ?? '';
    }
  }

  throw new Error('Limite de iterações atingido (possível loop infinito)');
  return "";
}