import { create } from 'zustand';
import { Agent } from '@brainstorm-cafe/shared';

interface AgentState {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  getAgentsByType: (type: Agent['type']) => Agent[];
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates, updatedAt: new Date() } : agent
      ),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),

  getAgentsByType: (type) => {
    return get().agents.filter((agent) => agent.type === type);
  },
}));
