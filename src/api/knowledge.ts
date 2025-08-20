// src/api/knowledge.ts
import { KnowledgeBase } from '../../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const listKnowledgeBases = (): Promise<KnowledgeBase[]> => {
  return executeSidecarCommand<KnowledgeBase[]>('listKnowledgeBases');
};

export const createKnowledgeBase = (
  name: string,
  description: string,
  embeddingModel: string
): Promise<KnowledgeBase> => {
  return executeSidecarCommand<KnowledgeBase>('createKnowledgeBase', [name, description, embeddingModel]);
};

export const addFileToKnowledgeBase = (kbId: string, fileId: string): Promise<void> => {
  return executeSidecarCommand('addFileToKnowledgeBase', [kbId, fileId]);
};

export const deleteKnowledgeBase = (kbId: string): Promise<void> => {
    return executeSidecarCommand('deleteKnowledgeBase', [kbId]);
};