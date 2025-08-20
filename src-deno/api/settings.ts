// src-deno/api/settings.ts
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
  sqlitePath?: string;

  // MCP settings
  mcpServers: MCPServer[];
}

export interface MCPServer {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
}