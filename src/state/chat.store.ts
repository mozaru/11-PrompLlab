// src/state/chat.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { ChatMessage, SendStatus } from '../types/chat';
import { compileContext } from '../lib/context/compile';
import { openaiChat } from '../adapters/model-client/openai';
import { useSettings } from './settings.store';
import { usePrompts } from './prompts.store';
import { usePlaceholders } from './placeholders.store';
import { renderTemplate } from '../lib/template/render';

type ChatState = {
  messages: ChatMessage[];
  status: SendStatus;
  useHistory: boolean;
  lastError?: string;

  send: (text: string) => Promise<void>;
  addUserMessage: (text: string) => string;
  addAssistantMessage: (text: string) => string;
  toggleInclude: (id: string, include: boolean) => void;
  clear: () => void;
  toggleHistory: (on: boolean) => void;
};

export const useChat = create<ChatState>()(
  immer((set, get) => ({
    messages: [],
    status: 'idle',
    useHistory: true,

    addUserMessage: (text: string) => {
      const id = nanoid();
      set((s) => {
        s.messages.push({ id, role: 'user', content: text, createdAt: Date.now(), include: true });
      });
      return id;
    },

    addAssistantMessage: (text: string) => {
      const id = nanoid();
      set((s) => {
        s.messages.push({ id, role: 'assistant', content: text, createdAt: Date.now(), include: true });
      });
      return id;
    },

    toggleInclude: (id, include) =>
      set((s) => {
        const m = s.messages.find((x) => x.id === id);
        if (m) m.include = include;
      }),

    clear: () => set((s) => void (s.messages = [])),
    toggleHistory: (on: boolean) => set((s) => void (s.useHistory = on)),

    send: async (text: string) => {
      const settings = useSettings.getState();
      const apiKey = settings.readApiKeyEffective();
      const baseUrl = settings.cfg.openai.base_url ?? 'https://api.openai.com';
      const model = settings.cfg.openai.model_default;

      if (!apiKey) {
        set((s) => {
          s.status = 'error';
          s.lastError = 'API key ausente. Configure em Configurações Globais.';
        });
        return;
      }

      // 1) Adiciona a mensagem raw do usuário para o HISTÓRICO da UI
      const userId = get().addUserMessage(text);

      set((s) => { s.status = 'sending'; s.lastError = undefined; });

      try {
        // 2) Lê System e User Template
        const { systemPrompt, userTemplate } = usePrompts.getState();

        // 3) Decide como montar o contexto de envio
        let messagesForContext: ChatMessage[] = get().messages;
        let injectFromTemplate = false;
        let injectedText = '';

        if (userTemplate && userTemplate.trim().length > 0) {
          // 3a) Extrai valores do TEXTO DIGITADO usando placeholders atuais
          const phStore = usePlaceholders.getState();
          const values = await phStore.valuesFromText(text);

          // 3b) Renderiza o template
          injectedText = renderTemplate(userTemplate, values, { keepUnresolved: true });
          injectFromTemplate = true;

          // 3c) Exclui a ÚLTIMA mensagem do usuário (raw) do contexto de envio
          //     (mas não altera o store; usamos uma cópia)
          const arr = [...get().messages].map((m) => ({ ...m }));
          const lastIdx = [...arr].reverse().find((m) => m.role === 'user')?.id === userId
            ? arr.length - 1
            : arr.findLastIndex?.((m) => m.role === 'user' && m.id === userId) ?? (() => {
                // polyfill simples para ambientes sem findLastIndex
                for (let i = arr.length - 1; i >= 0; i--) {
                  if (arr[i].role === 'user' && arr[i].id === userId) return i;
                }
                return -1;
              })();

          if (lastIdx !== -1) {
            arr[lastIdx].include = false;
          }
          messagesForContext = arr;
        }

        // 4) Compila contexto
        const ctx = compileContext({
          systemPrompt,
          messages: messagesForContext,
          useHistory: get().useHistory,
          userTemplate: injectFromTemplate ? injectedText : undefined,
          values: undefined,                 // já renderizado acima
          injectUserFromTemplate: injectFromTemplate,
        });

        // 5) Chama OpenAI
        const reply = await openaiChat(
          { apiKey, baseUrl, model, temperature: 0.2, maxTokens: 2000 },
          ctx
        );

        // 6) Adiciona resposta no histórico da UI
        get().addAssistantMessage(reply);
        set((s) => { s.status = 'idle'; });
      } catch (e: any) {
        set((s) => {
          s.status = 'error';
          s.lastError = String(e?.message ?? e);
          const msg = s.messages.find((m) => m.id === userId);
          if (msg) msg.error = true;
        });
      }
    },
  }))
);
