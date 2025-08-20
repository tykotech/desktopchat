// src-deno/tauri_commands.ts
// This file is the single source of truth for all backend functions exposed to the frontend via Tauri's `invoke` system.

import { SettingsService } from "./services/settings_service.ts";
import { FileService } from "./services/file_service.ts";
import { KnowledgeService } from "./services/knowledge_service.ts";
import { AssistantService } from "./services/assistant_service.ts";
import { AgentService } from "./services/agent_service.ts";
import { ChatService } from "./services/chat_service.ts";
import { SecretsService } from "./services/secrets_service.ts";
import { ProviderService } from "./services/provider_service.ts";
import { initializeStorage } from "./init_storage.ts";
import type { AppSettings, MCPServer, AssistantConfig, MessagePayload } from "./main.ts"; // TODO: Move types to a dedicated types.ts file

// --- Initialization ---
// This command should be called by the Rust backend once when the app starts.
export async function initializeApp() {
  await SecretsService.loadSecrets();
  await initializeStorage();
  const settings = await SettingsService.getAppSettings();
  // Use console.error for logging since stdout is reserved for command responses.
  console.error(`Initialization complete. Data directory: ${settings.dataDirectory}`);
  return "Initialization complete.";
}

// --- Settings Commands ---
export const getAppSettings = () => SettingsService.getAppSettings();
export const updateAppSettings = (settings: AppSettings) => SettingsService.updateAppSettings(settings);

// --- Secrets Commands ---
export const getSecret = (key: string) => SecretsService.getSecret(key);
export const setSecret = (key: string, value: string) => SecretsService.setSecret(key, value);

// --- File Management Commands ---
export const listFiles = () => FileService.listFiles();
export const uploadFile = (filePath: string, fileName:string) => FileService.uploadFile(filePath, fileName);
export const deleteFile = (fileId: string) => FileService.deleteFile(fileId);

// --- Knowledge Base Commands ---
export const createKnowledgeBase = (name: string, description: string, embeddingModel: string) => KnowledgeService.createKnowledgeBase(name, description, embeddingModel);
export const listKnowledgeBases = () => KnowledgeService.listKnowledgeBases();
export const getKnowledgeBaseFiles = (kbId: string) => KnowledgeService.getKnowledgeBaseFiles(kbId);
export const addFileToKnowledgeBase = (kbId: string, fileId: string) => KnowledgeService.addFileToKnowledgeBase(kbId, fileId);
export const deleteKnowledgeBase = (kbId: string) => KnowledgeService.deleteKnowledgeBase(kbId);

// --- Assistant Commands ---
export const createAssistant = (config: AssistantConfig) => AssistantService.createAssistant(config);
export const listAssistants = () => AssistantService.listAssistants();
export const updateAssistant = (assistantId: string, config: Partial<AssistantConfig>) => AssistantService.updateAssistant(assistantId, config);
export const deleteAssistant = (assistantId: string) => AssistantService.deleteAssistant(assistantId);

// --- Agent Commands ---
export const listAgents = () => AgentService.listAgents();

// --- Chat Commands ---
export const startChatSession = (assistantId: string) => ChatService.startChatSession(assistantId);
export const sendMessage = (sessionId: string, message: MessagePayload) => ChatService.sendMessage(sessionId, message.content);

// --- Provider Commands ---
export const testProviderConnection = (providerId: string) => ProviderService.testConnection(providerId);
export const listProviderModels = (providerId: string) => ProviderService.listAvailableModels(providerId);
export const getProviderConfig = (providerId: string) => ProviderService.getProviderConfig(providerId);

// --- MCP (Multi-Cloud Provider) Commands ---
export const listMcpServers = async (): Promise<MCPServer[]> => {
    const settings = await SettingsService.getAppSettings();
    return settings.mcpServers || [];
};

export const addMcpServer = async (server: MCPServer): Promise<void> => {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    mcpServers.push({ ...server, id: Date.now() });
    await SettingsService.updateAppSettings({ ...settings, mcpServers });
};

export const updateMcpServer = async (serverId: number, updates: Partial<MCPServer>): Promise<void> => {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    const index = mcpServers.findIndex(s => s.id === serverId);
    if (index !== -1) {
        mcpServers[index] = { ...mcpServers[index], ...updates };
        await SettingsService.updateAppSettings({ ...settings, mcpServers });
    }
};

export const removeMcpServer = async (serverId: number): Promise<void> => {
    const settings = await SettingsService.getAppSettings();
    let mcpServers = settings.mcpServers || [];
    mcpServers = mcpServers.filter(s => s.id !== serverId);
    await SettingsService.updateAppSettings({ ...settings, mcpServers });
};

export const testMcpServerConnection = (url: string) => ProviderService.testMcpServerConnection(url);