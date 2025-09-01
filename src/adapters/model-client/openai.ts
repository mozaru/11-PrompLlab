import { backoff } from '../../lib/retry/backoff';

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
