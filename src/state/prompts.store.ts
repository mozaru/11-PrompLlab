import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type PromptsState = {
  systemPrompt: string;
  userTemplate: string;
  setSystem: (v: string) => void;
  setUserTpl: (v: string) => void;
  reset: () => void;
};

export const usePrompts = create<PromptsState>()(
  immer((set) => ({
    systemPrompt: '',
    userTemplate: '',
    setSystem: (v) => set((s) => void (s.systemPrompt = v)),
    setUserTpl: (v) => set((s) => void (s.userTemplate = v)),
    reset: () => set((s) => { s.systemPrompt = ''; s.userTemplate = ''; }),
  }))
);
