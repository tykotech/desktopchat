// src/api/chat.ts
import { ChatSession, MessagePayload } from '../../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const startChatSession = (assistantId: string): Promise<ChatSession> => {
  return executeSidecarCommand<ChatSession>('startChatSession', [assistantId]);
};

export const sendMessage = (sessionId: string, message: MessagePayload): Promise<void> => {
  return executeSidecarCommand('sendMessage', [sessionId, message]);
};