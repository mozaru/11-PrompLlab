import type { ChatMessage } from '../../types/chat';
import { renderTemplate } from '../template/render';

/**
 * Monta o contexto para a OpenAI.
 * - Sempre inclui systemPrompt (se houver).
 * - Se useHistory=true → inclui histórico (respeitando flag include).
 * - Se injectUserFromTemplate=true e userTemplate fornecido → injeta mensagem de usuário renderizada (com values).
 *   (não usamos no Chat ainda para evitar duplicação; ficará útil para Batch)
 */
export function compileContext(opts: {
  systemPrompt?: string;
  messages: ChatMessage[];
  useHistory: boolean;
  userTemplate?: string;
  values?: Record<string, string>;
  injectUserFromTemplate?: boolean;
}) {
  const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (opts.systemPrompt && opts.systemPrompt.trim().length) {
    openAiMessages.push({ role: 'system', content: opts.systemPrompt });
  }

  const msgs = opts.useHistory
    ? opts.messages.filter((m) => m.include !== false)
    : [];

  for (const m of msgs) {
    openAiMessages.push({ role: m.role === 'assistant' ? 'assistant' : m.role, content: m.content });
  }

  if (opts.injectUserFromTemplate && opts.userTemplate) {
    const rendered = renderTemplate(opts.userTemplate, opts.values ?? {}, { keepUnresolved: true });
    if (rendered && rendered.trim().length) {
      openAiMessages.push({ role: 'user', content: rendered });
    }
  }

  return openAiMessages;
}
