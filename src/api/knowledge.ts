// src/api/knowledge.ts
import { KnowledgeBase } from '../../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const listKnowledgeBases = async (): Promise<KnowledgeBase[]> => {
  // In a real implementation:
  // return await invoke('list_knowledge_bases');
  
  // For now, we'll fetch from the HTTP API
  const response = await fetch('http://localhost:8000/api/knowledge-bases');
  return await response.json();
};

export const createKnowledgeBase = async (
  name: string,
  description: string,
  embeddingModel: string
): Promise<KnowledgeBase> => {
  // In a real implementation:
  // return await invoke('create_knowledge_base', { name, description, embeddingModel });
  
  // For now, we'll use the HTTP API
  const response = await fetch('http://localhost:8000/api/knowledge-bases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description, embeddingModel }),
  });
  return await response.json();
};

export const addFileToKnowledgeBase = async (kbId: string, fileId: string): Promise<void> => {
  // In a real implementation:
  // return await invoke('add_file_to_knowledge_base', { kbId, fileId });
  
  // For now, we'll use the HTTP API
  await fetch('http://localhost:8000/api/knowledge-bases/add-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ kbId, fileId }),
  });
};