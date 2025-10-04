// src/state/chat.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { ChatMessage, SendStatus } from '../types/chat';
import { compileContext } from '../lib/context/compile';
import { openaiChat, openaiChatWithAgent, type OpenAIChatParams } from '../adapters/model-client/openai';
import { useSettings } from './settings.store';
import { usePrompts } from './prompts.store';
import { useAgentsStore } from './agents.store';

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
      set((s:ChatState) => {
        s.messages.push({ id, role: 'user', content: text, createdAt: Date.now(), include: true });
      });
      return id;
    },

    addAssistantMessage: (text: string) => {
      const id = nanoid();
      set((s:ChatState) => {
        s.messages.push({ id, role: 'assistant', content: text, createdAt: Date.now(), include: true });
      });
      return id;
    },

    toggleInclude: (id:string, include:boolean) =>
      set((s:ChatState) => {
        const m = s.messages.find((x) => x.id === id);
        if (m) m.include = include;
      }),

    clear: () => set((s:ChatState) => void (s.messages = [])),
    toggleHistory: (on: boolean) => set((s:ChatState) => void (s.useHistory = on)),

    send: async (text: string) => {
      const settings = useSettings.getState();
      const apiKey = settings.readApiKeyEffective();
      const baseUrl = settings.cfg.openai.base_url ?? 'https://api.openai.com';
      const model = settings.cfg.openai.model_default;
      const agents = useAgentsStore.getState().agents;

      if (!apiKey) {
        set((s:ChatState) => {
          s.status = 'error';
          s.lastError = 'API key ausente. Configure em Configurações Globais.';
        });
        return;
      }

      set((s:ChatState) => { s.status = 'sending'; s.lastError = undefined; });
      const userId = get().addUserMessage(text);
      try {
        // 2) Lê System e User Template
        const { systemPrompt, userTemplate } = usePrompts.getState();
        // 3) Decide como montar o contexto de envio
        const messagesForContext: ChatMessage[] = Array.from(get().messages);
        messagesForContext.pop(); //remove o ultimo que eh a userid
        const ctx = await compileContext({
          systemPrompt,
          messages: messagesForContext,
          useHistory: get().useHistory,
          userTextRaw: text,              // pergunta corrente
          userTemplate,                   // pode estar vazio
          injectUserFromTemplate: !!userTemplate && userTemplate.trim().length > 0,
          baseKnowledge: usePrompts.getState().knowledgeBase, // se já tiver aplicado o patch da store
        });
        const params: OpenAIChatParams = {apiKey, baseUrl, model, temperature: 0.2, maxTokens: 2000 };

        const reply = agents ? await openaiChatWithAgent(params, ctx, agents ) : await openaiChat(params, ctx ) ;
        
        get().addAssistantMessage(reply);
        set((s:ChatState) => { s.status = 'idle'; });
      } catch (e: any) {
        set((s:ChatState) => {
          s.status = 'error';
          s.lastError = String(e?.message ?? e);
          const msg = s.messages.find((m) => m.id === userId);
          if (msg) msg.error = true;
        });
      }
    },
  }))
);
