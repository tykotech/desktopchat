// src/api/knowledge.ts
import { invoke } from '@tauri-apps/api/core';
import type { KnowledgeBase } from '../../src-deno/main.ts';

export type { KnowledgeBase };

export const listKnowledgeBases = (): Promise<KnowledgeBase[]> => {
  return invoke<KnowledgeBase[]>('listKnowledgeBases');
};

export const createKnowledgeBase = (
  name: string,
  description: string,
  embeddingModel: string
): Promise<KnowledgeBase> => {
  return invoke<KnowledgeBase>('createKnowledgeBase', { name, description, embeddingModel });
};

export const addFileToKnowledgeBase = (
  kbId: string,
  fileId: string
): Promise<void> => {
  return invoke('addFileToKnowledgeBase', { kbId, fileId });
};

export const deleteKnowledgeBase = (kbId: string): Promise<void> => {
  return invoke('deleteKnowledgeBase', { kbId });
};