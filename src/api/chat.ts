// src/api/chat.ts
import { invoke } from '@tauri-apps/api/core';
import type { ChatSession, MessagePayload } from '../../src-deno/main.ts';

export type { ChatSession, MessagePayload };

export const startChatSession = (assistantId: string): Promise<ChatSession> => {
  return invoke<ChatSession>('startChatSession', { assistantId });
};

export const sendMessage = (sessionId: string, message: MessagePayload): Promise<void> => {
  return invoke('sendMessage', { sessionId, message });
};