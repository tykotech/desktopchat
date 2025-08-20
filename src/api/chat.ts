// src/api/chat.ts
import { invoke } from '@tauri-apps/api/core';

export interface ChatSession {
  id: string;
  assistantId: string;
  title: string;
  createdAt: string;
}

export interface MessagePayload {
  content: string;
  role: 'user' | 'assistant';
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const startChatSession = (
  assistantId: string,
): Promise<ChatSession> => {
  return invoke('start_chat_session', { assistantId }) as Promise<ChatSession>;
};

export const sendMessage = (
  sessionId: string,
  payload: MessagePayload,
): Promise<ChatMessage> => {
  return invoke('send_message', {
    sessionId,
    content: payload.content,
  }) as Promise<ChatMessage>;
};

export const listChatSessions = (): Promise<ChatSession[]> => {
  return invoke('list_chat_sessions').then((res) =>
    typeof res === 'string' ? JSON.parse(res) : (res as ChatSession[])
  );
};

export const getSessionMessages = (
  sessionId: string,
): Promise<ChatMessage[]> => {
  return invoke<string>('get_session_messages', { sessionId }).then((res) =>
    typeof res === 'string' ? JSON.parse(res) : (res as ChatMessage[])
  return invoke<ChatMessage[]>('get_session_messages', { sessionId });
};
