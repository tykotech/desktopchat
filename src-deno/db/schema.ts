// src-deno/db/schema.ts
// Database schema as specified in the design document

export interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: "PENDING" | "PROCESSING" | "INDEXED" | "ERROR";
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embeddingModel: string;
  vectorSize: number;
  createdAt: string;
}

export interface KnowledgeBaseFile {
  knowledgeBaseId: string;
  fileId: string;
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

export interface AssistantKnowledgeBase {
  assistantId: string;
  knowledgeBaseId: string;
}

export interface ChatSession {
  id: string;
  assistantId: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChunkPayload {
  content: string;
  fileId: string;
  fileName: string;
  chunkIndex: number;
}

// Additional interfaces for agents and settings
export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface AppSettings {
  // General settings
  theme: string;
  language: string;
  username: string;
  fontSize: string;
  autoSave: boolean;
  notifications: boolean;
  autoUpdate: boolean;
  dataCollection: boolean;
  
  // Model settings
  defaultChatModel: string;
  defaultEmbeddingModel: string;
  temperature: number;
  maxTokens: number;
  
  // Provider settings (stored in keychain, but we track which providers are configured)
  configuredProviders: string[];
  
  // Web search settings
  defaultWebSearchProvider: string;
  braveApiKey?: string;
  googleApiKey?: string;
  googleCseId?: string;
  serpApiKey?: string;
  
  // Data settings
  qdrantUrl: string;
  qdrantApiKey?: string;
  dataDirectory: string;
  
  // MCP settings
  mcpServers: MCPServer[];
}

export interface MCPServer {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
}

export interface AssistantConfig {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  knowledgeBaseIds?: string[];
}

export interface MessagePayload {
  content: string;
  role: "user" | "assistant";
}