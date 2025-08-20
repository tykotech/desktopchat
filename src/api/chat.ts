// src/api/chat.ts
import { ChatSession, MessagePayload } from '../../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const startChatSession = async (assistantId: string): Promise<ChatSession> => {
  // In a real implementation:
  // return await invoke('start_chat_session', { assistantId });
  
  // For now, we'll use the HTTP API
  const response = await fetch('http://localhost:8000/api/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistantId }),
  });
  return await response.json();
};

export const sendMessage = async (sessionId: string, message: MessagePayload): Promise<void> => {
  // In a real implementation:
  // return await invoke('send_message', { sessionId, message });
  
  // For now, we'll use the HTTP API
  await fetch(`http://localhost:8000/api/chat/sessions/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
};