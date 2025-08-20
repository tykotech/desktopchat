// src-deno/api/chat.ts
export interface ChatSession {
  id: string;
  assistantId: string;
  title: string;
  createdAt: string;
}

export interface MessagePayload {
  content: string;
  role: "user" | "assistant";
}