import type { ChatMessage } from '../../types/chat';
import { renderTemplate } from '../template/render';
import { usePlaceholders } from '../../state/placeholders.store';

/**
 * Monta o contexto para a OpenAI.
 * - Sempre inclui systemPrompt (se houver).
 * - Se useHistory=true → inclui histórico (respeitando flag include).
 * - Se injectUserFromTemplate=true e userTemplate fornecido → injeta mensagem de usuário renderizada (com values).
 *   (não usamos no Chat ainda para evitar duplicação; ficará útil para Batch)
 */
export async function compileContext(opts: {
  systemPrompt?: string;
  messages: ChatMessage[];
  useHistory: boolean;
  userTextRaw: string;
  userTemplate?: string;
  injectUserFromTemplate?: boolean;
  baseKnowledge?: string;
}) {
  const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  const ph = usePlaceholders.getState();
  let userContent = (opts.userTextRaw ?? '').toString();
  const currentValues = await ph.valuesFromText(userContent);
  // 1) System
  if (opts.systemPrompt && opts.systemPrompt.trim().length) {
    const sp = renderTemplate(opts.systemPrompt, currentValues, { keepUnresolved: true });
    openAiMessages.push({ role: 'system', content: sp });
  }

  // 2) Histórico (user/assistant), respeitando include
  const history = opts.useHistory ? opts.messages.filter((m) => m.include !== false) : [];
  for (const m of history) {
    if (m.role === 'user' && opts.injectUserFromTemplate && opts.userTemplate && opts.userTemplate.trim().length > 0)
    {
      const values = await ph.valuesFromText(m.content);
      const rendered = renderTemplate(opts.userTemplate, values, { keepUnresolved: true });
      if (rendered && rendered.trim().length > 0) 
        openAiMessages.push({ role: m.role, content: rendered });      
      else
        openAiMessages.push({ role: m.role, content: m.content });
    }
    else
      openAiMessages.push({ role: m.role, content: m.content });
  }

  // 3) Pergunta atual (user), com template opcional
  if (
    opts.injectUserFromTemplate &&
    opts.userTemplate &&
    opts.userTemplate.trim().length > 0
  ) {
    const rendered = renderTemplate(opts.userTemplate, currentValues, { keepUnresolved: true });
    if (rendered && rendered.trim().length > 0) {
      userContent = rendered;
    }
  }
  if (userContent.trim().length > 0) {
    openAiMessages.push({ role: 'user', content: userContent });
  }

  // 4) Base de Conhecimento (assistant) — sempre por último, se houver
  if (opts.baseKnowledge && opts.baseKnowledge.trim().length) {
    openAiMessages.push({ role: 'assistant', content: opts.baseKnowledge });
  }

  return openAiMessages;
}