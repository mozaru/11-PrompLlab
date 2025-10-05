// src/state/mcp.store.ts
import { create } from 'zustand';
import { type MCPInfo } from '../types/mcp';
import { v4 as uuidv4 } from 'uuid';

interface MCPStore {
  mcps: MCPInfo[];
  addMCP: (mcp: Omit<MCPInfo, 'id' | 'last_updated'>) => void;
  updateMCP: (id: string, data: Partial<MCPInfo>) => void;
  removeMCP: (id: string) => void;
  setMCPs: (list: MCPInfo[]) => void;
  clear: () => void;
}

export const useMCPStore = create<MCPStore>((set, get) => ({
  mcps: [],

  addMCP: (mcp) => {
    const newMCP: MCPInfo = {
      ...mcp,
      id: uuidv4(),
      last_updated: new Date().toISOString(),
    };
    set({ mcps: [...get().mcps, newMCP] });
  },

  updateMCP: (id, data) => {
    set({
      mcps: get().mcps.map((mcp) =>
        mcp.id === id ? { ...mcp, ...data, last_updated: new Date().toISOString() } : mcp
      ),
    });
  },

  removeMCP: (id) => {
    set({ mcps: get().mcps.filter((mcp) => mcp.id !== id) });
  },

  setMCPs: (list) => {
    set({ mcps: list });
  },

  clear: () => {
    set({ mcps: [] });
  },
}));
