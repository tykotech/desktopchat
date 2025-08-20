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
import { register } from "@tauri-apps/api/core";

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

// Command implementations
export function getAppSettings() {
  return SettingsService.getAppSettings();
}

export function updateAppSettings(settings: AppSettings) {
  return SettingsService.updateAppSettings(settings);
}

export function getSecret(key: string) {
  return SecretsService.getSecret(key);
}

export function setSecret(key: string, value: string) {
  return SecretsService.setSecret(key, value);
}

export function listFiles() {
  return FileService.listFiles();
}

export function uploadFile(filePath: string, fileName: string) {
  return FileService.uploadFile(filePath, fileName);
}

export function deleteFile(fileId: string) {
  return FileService.deleteFile(fileId);
}

export function createKnowledgeBase(
  name: string,
  description: string,
  embeddingModel: string,
) {
  return KnowledgeService.createKnowledgeBase(
    name,
    description,
    embeddingModel,
  );
}

export function listKnowledgeBases() {
  return KnowledgeService.listKnowledgeBases();
}

export function addFileToKnowledgeBase(kbId: string, fileId: string) {
  return KnowledgeService.addFileToKnowledgeBase(kbId, fileId);
}

export function deleteKnowledgeBase(kbId: string) {
  return KnowledgeService.deleteKnowledgeBase(kbId);
}

export function createAssistant(config: AssistantConfig) {
  return AssistantService.createAssistant(config);
}

export function listAssistants() {
  return AssistantService.listAssistants();
}

export function updateAssistant(
  assistantId: string,
  config: Partial<AssistantConfig>,
) {
  return AssistantService.updateAssistant(assistantId, config);
}

export function deleteAssistant(assistantId: string) {
  return AssistantService.deleteAssistant(assistantId);
}

export function listAgents() {
  return AgentService.listAgents();
}

export function startChatSession(assistantId: string) {
  return ChatService.startChatSession(assistantId);
}

export function sendMessage(sessionId: string, message: MessagePayload) {
  return ChatService.sendMessage(sessionId, message.content);
}

export function testProviderConnection(providerId: string) {
  return ProviderService.testConnection(providerId);
}

export function listProviderModels(providerId: string) {
  return ProviderService.listAvailableModels(providerId);
}

export function getProviderConfig(providerId: string) {
  return ProviderService.getProviderConfig(providerId);
}

export function testMcpServerConnection(url: string) {
  return ProviderService.testMcpServerConnection(url);
}

const commands = {
  getAppSettings,
  updateAppSettings,
  getSecret,
  setSecret,
  listFiles,
  uploadFile,
  deleteFile,
  createKnowledgeBase,
  listKnowledgeBases,
  addFileToKnowledgeBase,
  deleteKnowledgeBase,
  createAssistant,
  listAssistants,
  updateAssistant,
  deleteAssistant,
  listAgents,
  startChatSession,
  sendMessage,
  testProviderConnection,
  listProviderModels,
  getProviderConfig,
  testMcpServerConnection,
};

// Initialize and register commands
async function registerCommands() {
  await SecretsService.loadSecrets();
  await initializeStorage();
  const settings = await SettingsService.getAppSettings();
  console.error(
    `Initialization complete. Data directory: ${settings.dataDirectory}`,
  );

  for (const [name, handler] of Object.entries(commands)) {
    register(name, handler);
  }
  console.error("Backend ready. Commands registered with Tauri.");
}

registerCommands().catch((err) => {
  console.error(`Critical error during backend initialization: ${err.message}`);
  Deno.exit(1);
});
