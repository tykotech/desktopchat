// src/api/knowledge.ts
import { core } from '@tauri-apps/api';
import type { KnowledgeBase } from './types';

export const listKnowledgeBases = (): Promise<KnowledgeBase[]> => {
  return core.invoke('listKnowledgeBases');
};

export const createKnowledgeBase = (
  name: string,
  description: string,
  embeddingModel: string
): Promise<KnowledgeBase> => {
  return core.invoke('createKnowledgeBase', { name, description, embeddingModel });
};

export const addFileToKnowledgeBase = (kbId: string, fileId: string): Promise<void> => {
  return core.invoke('addFileToKnowledgeBase', { kbId, fileId });
};

export const deleteKnowledgeBase = (kbId: string): Promise<void> => {
    return core.invoke('deleteKnowledgeBase', { kbId });
};