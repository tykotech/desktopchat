// src-deno/tauri_commands.ts
import { 
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
  listKnowledgeBaseFiles,
  removeFileFromKnowledgeBase,
  deleteKnowledgeBase,
  createAssistant,
  listAssistants,
  updateAssistant,
  deleteAssistant,
  listAgents,
  startChatSession,
  sendMessage,
  testWebSearchProvider,
} from "./main.ts";

// Import provider and MCP command implementations
import {
  testProviderConnectionCommand,
  listProviderModelsCommand,
  getProviderConfigCommand,
  listMcpServersCommand,
  addMcpServerCommand,
  updateMcpServerCommand,
  removeMcpServerCommand,
  testMcpServerConnectionCommand
} from "./api/provider_commands.ts";
import { testWebSearchConnectionCommand } from "./api/web_search_commands.ts";

// Type exports
export type { 
  AppSettings, 
  MCPServer, 
  ManagedFile, 
  KnowledgeBase, 
  AssistantConfig, 
  Assistant, 
  Agent, 
  ChatSession, 
  MessagePayload 
} from "./main.ts";

// This file exports all the functions that will be registered as Tauri commands
// In a real implementation, these would be properly integrated with Tauri's command system

export {
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
  listKnowledgeBaseFiles,
  removeFileFromKnowledgeBase,
  deleteKnowledgeBase,
  createAssistant,
  listAssistants,
  updateAssistant,
  deleteAssistant,
  listAgents,
  startChatSession,
  sendMessage,
  testWebSearchProvider,
  // Provider commands
  testProviderConnectionCommand as testProviderConnection,
  listProviderModelsCommand as listProviderModels,
  getProviderConfigCommand as getProviderConfig,
  // MCP commands
  listMcpServersCommand as listMcpServers,
  addMcpServerCommand as addMcpServer,
  updateMcpServerCommand as updateMcpServer,
  removeMcpServerCommand as removeMcpServer,
  testMcpServerConnectionCommand as testMcpServerConnection,
  // Web search commands
  testWebSearchConnectionCommand as testWebSearchConnection
};