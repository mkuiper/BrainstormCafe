import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  isConnected: boolean;
  setSessionId: (id: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  isConnected: false,
  setSessionId: (id) => set({ sessionId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
}));
