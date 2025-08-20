// src/api/chat.ts
import { core } from '@tauri-apps/api';
import type { ChatSession, MessagePayload } from './types';

export const startChatSession = (assistantId: string): Promise<ChatSession> => {
  return core.invoke('startChatSession', { assistantId });
};

export const sendMessage = (sessionId: string, message: MessagePayload): Promise<void> => {
  return core.invoke('sendMessage', { sessionId, message });
};