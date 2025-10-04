// src/state/agents.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AgentTool } from '../types/chat';

type AgentStore = {
  agents: AgentTool[];
  setAgents: (agents: AgentTool[]) => void;
  addAgent: (agent: AgentTool) => void;
  updateAgent: (name: string, updated: AgentTool) => void;
  removeAgent: (name: string) => void;
  reset: () => void;
};

export const useAgentsStore = create<AgentStore>(
  immer((set) => ({
    agents: [],
    setAgents: (agents:AgentTool[]) => set({ agents }),
    addAgent: (agent:AgentTool) => set((s:AgentStore) => ({ agents: [...s.agents, agent] })),

    updateAgent: (name:string, updated:AgentStore) =>
      set((s:AgentStore) => ({
        agents: s.agents.map((a) => (a.name === name ? updated : a)),
      })),

    removeAgent: (name:string) =>
      set((s:AgentStore) => ({
        agents: s.agents.filter((a) => a.name !== name),
      })),
    reset: () => set((s:AgentStore) => { 
       s.agents = []; 
     }),
   }))
);

