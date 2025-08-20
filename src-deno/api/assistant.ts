// src-deno/api/assistant.ts
export interface AssistantConfig {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  knowledgeBaseIds?: string[];
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  createdAt: string;
  knowledgeBaseIds: string[];
}