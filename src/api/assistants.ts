// src/api/assistants.ts
import { invoke } from '@tauri-apps/api/core';
import type { Assistant, AssistantConfig } from '../../src-deno/main.ts';

export type { Assistant, AssistantConfig };

export const listAssistants = (): Promise<Assistant[]> => {
  return invoke<Assistant[]>('listAssistants');
};

export const createAssistant = (config: AssistantConfig): Promise<Assistant> => {
  return invoke<Assistant>('createAssistant', { config });
};

export const updateAssistant = (
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<Assistant> => {
  return invoke<Assistant>('updateAssistant', { assistantId, config });
};

export const deleteAssistant = (assistantId: string): Promise<void> => {
  return invoke('deleteAssistant', { assistantId });
};