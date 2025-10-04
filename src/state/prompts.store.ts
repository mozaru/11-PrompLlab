import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type PromptsState = {
   systemPrompt: string;
   knowledgeBase: string;
   userTemplate: string;
   setSystem: (v: string) => void;
   setKnowledgeBase: (v: string) => void;
   setUserTpl: (v: string) => void;
   reset: () => void;
};

export const usePrompts = create<PromptsState>()(
   immer((set) => ({
     systemPrompt: '',
     knowledgeBase: '',
     userTemplate: '',
     setSystem: (v:string) => set((s:PromptsState) => void (s.systemPrompt = v)),
     setKnowledgeBase: (v:string) => set((s:PromptsState) => void (s.knowledgeBase = v)),
     setUserTpl: (v:string) => set((s:PromptsState) => void (s.userTemplate = v)),
     reset: () => set((s:PromptsState) => { 
       s.systemPrompt = ''; 
       s.knowledgeBase = ''; 
       s.userTemplate = ''; 
     }),
   }))
);

