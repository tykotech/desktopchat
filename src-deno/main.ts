// src-deno/main.ts
import { SettingsService } from "./services/settings_service.ts";
import { FileService } from "./services/file_service.ts";
import { KnowledgeService } from "./services/knowledge_service.ts";
import { AssistantService } from "./services/assistant_service.ts";
import { AgentService } from "./services/agent_service.ts";
import { ChatService } from "./services/chat_service.ts";
import { SecretsService } from "./services/secrets_service.ts";
import { ProviderService } from "./services/provider_service.ts";
import { initializeStorage } from "./init_storage.ts";
import { readLines } from "https://deno.land/std@0.224.0/io/mod.ts";

// Type definitions (keep them as they are)
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

export interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: string;
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

export interface AssistantConfig {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface ChatSession {
  id: string;
  assistantId: string;
  title: string;
  createdAt: string;
}

export interface MessagePayload {
  content: string;
  role: "user" | "assistant";
}

// Command Handlers
const commands: { [key: string]: (...args: any[]) => Promise<any> } = {
  getAppSettings: () => SettingsService.getAppSettings(),
  updateAppSettings: (settings: AppSettings) => SettingsService.updateAppSettings(settings),
  getSecret: (key: string) => SecretsService.getSecret(key),
  setSecret: (key: string, value: string) => SecretsService.setSecret(key, value),
  listFiles: () => FileService.listFiles(),
  uploadFile: (filePath: string, fileName: string) => FileService.uploadFile(filePath, fileName),
  deleteFile: (fileId: string) => FileService.deleteFile(fileId),
  createKnowledgeBase: (name: string, description: string, embeddingModel: string) => KnowledgeService.createKnowledgeBase(name, description, embeddingModel),
  listKnowledgeBases: () => KnowledgeService.listKnowledgeBases(),
  addFileToKnowledgeBase: (kbId: string, fileId: string) => KnowledgeService.addFileToKnowledgeBase(kbId, fileId),
  deleteKnowledgeBase: (kbId: string) => KnowledgeService.deleteKnowledgeBase(kbId),
  createAssistant: (config: AssistantConfig) => AssistantService.createAssistant(config),
  listAssistants: () => AssistantService.listAssistants(),
  updateAssistant: (assistantId: string, config: Partial<AssistantConfig>) => AssistantService.updateAssistant(assistantId, config),
  deleteAssistant: (assistantId: string) => AssistantService.deleteAssistant(assistantId),
  listAgents: () => AgentService.listAgents(),
  startChatSession: (assistantId: string) => ChatService.startChatSession(assistantId),
  sendMessage: (sessionId: string, message: MessagePayload) => ChatService.sendMessage(sessionId, message.content),
  testProviderConnection: (providerId: string) => ProviderService.testConnection(providerId),
  listProviderModels: (providerId: string) => ProviderService.listAvailableModels(providerId),
  getProviderConfig: (providerId: string) => ProviderService.getProviderConfig(providerId),
  testMcpServerConnection: (url: string) => ProviderService.testMcpServerConnection(url),
};

// Initialize the application
async function initializeApp() {
  await SecretsService.loadSecrets();
  await initializeStorage();
  const settings = await SettingsService.getAppSettings();
  // We can't use console.log for normal logging anymore, as stdout is for commands
  // For debugging, we can use console.error or write to a file.
  console.error(`Initialization complete. Data directory: ${settings.dataDirectory}`);
}

// Main loop to process commands from stdin
async function main() {
  await initializeApp();
  console.error("Backend ready. Listening for commands on stdin.");

  for await (const line of readLines(Deno.stdin)) {
    try {
      const { command, params, id } = JSON.parse(line);
      
      if (commands[command]) {
        const result = await commands[command](...(params || []));
        const response = { id, result };
        console.log(JSON.stringify(response));
      } else {
        throw new Error(`Unknown command: ${command}`);
      }
    } catch (error: any) {
      const response = { error: error.message };
      console.log(JSON.stringify(response)); // Send error back to stdout
    }
  }
}

if (import.meta.main) {
  main().catch(err => {
    // Write initialization errors to stderr
    console.error(`Critical error during backend execution: ${err.message}`);
    Deno.exit(1);
  });
}