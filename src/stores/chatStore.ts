// src/stores/chatStore.ts
import { create } from "zustand";
import type {
  ChatSession,
  ChatMessage,
} from "../api/chat";
import {
  listChatSessions,
  getSessionMessages,
} from "../api/chat";

interface ChatState {
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeSessionId: string | null;
  addSession: (session: ChatSession) => void;
  addMessage: (message: ChatMessage) => void;
  loadSessions: () => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  setActiveSessionId: (sessionId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  messages: [],
  activeSessionId: null,
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  loadSessions: async () => {
    const sessions = await listChatSessions();
    set({ sessions });
  },
  loadMessages: async (sessionId: string) => {
    const messages = await getSessionMessages(sessionId);
    set({ messages });
  },
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
}));
