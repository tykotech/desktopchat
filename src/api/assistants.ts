// src/api/assistants.ts
import { Assistant, AssistantConfig } from '../../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const listAssistants = (): Promise<Assistant[]> => {
  return executeSidecarCommand<Assistant[]>('listAssistants');
};

export const createAssistant = (config: AssistantConfig): Promise<Assistant> => {
  return executeSidecarCommand<Assistant>('createAssistant', [config]);
};

export const updateAssistant = (
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<Assistant> => {
  return executeSidecarCommand<Assistant>('updateAssistant', [assistantId, config]);
};

export const deleteAssistant = (assistantId: string): Promise<void> => {
  return executeSidecarCommand('deleteAssistant', [assistantId]);
};