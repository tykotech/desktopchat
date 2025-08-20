// src-deno/api/knowledge.ts
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embeddingModel: string;
  vectorSize: number;
  createdAt: string;
}