// src/api/assistants.ts
import { core } from '@tauri-apps/api';
import type { Assistant, AssistantConfig } from './types';

export const listAssistants = (): Promise<Assistant[]> => {
  return core.invoke('listAssistants');
};

export const createAssistant = (config: AssistantConfig): Promise<Assistant> => {
  return core.invoke('createAssistant', { config });
};

export const updateAssistant = (
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<Assistant> => {
  return core.invoke('updateAssistant', { assistantId, config });
};

export const deleteAssistant = (assistantId: string): Promise<void> => {
  return core.invoke('deleteAssistant', { assistantId });
};