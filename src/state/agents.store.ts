// src/state/agents.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AgentTool } from '../types/chat';

type AgentStore = {
  agents: AgentTool[];
  setAgents: (agents: AgentTool[]) => void;
  addAgent: (agent: AgentTool) => void;
  updateAgent: (id: string, updated: AgentTool) => void;
  removeAgent: (id: string) => void;
  reset: () => void;
};

export const useAgentsStore = create<AgentStore>(
  immer((set) => ({
    agents: [],
    //setAgents: (agents:AgentTool[]) => set({ agents }),
      setAgents: (agents: AgentTool[]) => {
      const validatedAgents = agents.map((agent) => {
        if (!agent.id) {
          return {
            ...agent,
            id: crypto.randomUUID(),
          };
        }
        return agent;
      });
      set({ agents: validatedAgents });
    },
    addAgent: (agent:AgentTool) => set((s:AgentStore) => ({ agents: [...s.agents, agent] })),

    updateAgent: (id:string, updated:AgentStore) =>
      set((s:AgentStore) => ({
        agents: s.agents.map((a) => (a.id === id ? updated : a)),
      })),

    removeAgent: (id:string) =>
      set((s:AgentStore) => ({
        agents: s.agents.filter((a) => a.id !== id),
      })),
    reset: () => set((s:AgentStore) => { 
       s.agents = []; 
     }),
   }))
);

