// src/stores/chatStore.ts
import { create } from "zustand";

interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  activeSessionId: string | null;
  streamingContent: string;
  isAssistantThinking: boolean;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setStreamingContent: (content: string) => void;
  setIsAssistantThinking: (thinking: boolean) => void;
  setActiveSessionId: (sessionId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeSessionId: null,
  streamingContent: "",
  isAssistantThinking: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        },
      ],
    })),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setIsAssistantThinking: (thinking) => set({ isAssistantThinking: thinking }),
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
}));