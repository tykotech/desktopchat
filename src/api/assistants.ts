// src/api/assistants.ts
import { Assistant, AssistantConfig } from '../../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const listAssistants = async (): Promise<Assistant[]> => {
  // In a real implementation:
  // return await invoke('list_assistants');
  
  // For now, we'll fetch from the HTTP API
  const response = await fetch('http://localhost:8000/api/assistants');
  return await response.json();
};

export const createAssistant = async (config: AssistantConfig): Promise<Assistant> => {
  // In a real implementation:
  // return await invoke('create_assistant', { config });
  
  // For now, we'll use the HTTP API
  const response = await fetch('http://localhost:8000/api/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return await response.json();
};

export const updateAssistant = async (
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<Assistant> => {
  // In a real implementation:
  // return await invoke('update_assistant', { assistantId, config });
  
  // For now, we'll use the HTTP API
  const response = await fetch(`http://localhost:8000/api/assistants/${assistantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return await response.json();
};

export const deleteAssistant = async (assistantId: string): Promise<void> => {
  // In a real implementation:
  // return await invoke('delete_assistant', { assistantId });
  
  // For now, we'll use the HTTP API
  await fetch(`http://localhost:8000/api/assistants/${assistantId}`, {
    method: 'DELETE',
  });
};