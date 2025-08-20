// src-deno/main.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SettingsService } from "./services/settings_service.ts";
import { FileService } from "./services/file_service.ts";
import { KnowledgeService } from "./services/knowledge_service.ts";
import { AssistantService } from "./services/assistant_service.ts";
import { AgentService } from "./services/agent_service.ts";
import { ChatService } from "./services/chat_service.ts";
import { SecretsService } from "./services/secrets_service.ts";
import { ProviderService } from "./services/provider_service.ts";
import { initializeStorage } from "./init_storage.ts";

// Type definitions
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

// Settings Commands
export async function getAppSettings(): Promise<AppSettings> {
  try {
    return await SettingsService.getAppSettings();
  } catch (error) {
    console.error("Error getting app settings:", error);
    throw error;
  }
}

export async function updateAppSettings(settings: AppSettings): Promise<void> {
  try {
    return await SettingsService.updateAppSettings(settings);
  } catch (error) {
    console.error("Error updating app settings:", error);
    throw error;
  }
}

export async function getSecret(key: string): Promise<string | null> {
  try {
    return await SecretsService.getSecret(key);
  } catch (error) {
    console.error(`Error getting secret ${key}:`, error);
    throw error;
  }
}

export async function setSecret(key: string, value: string): Promise<void> {
  try {
    return await SecretsService.setSecret(key, value);
  } catch (error) {
    console.error(`Error setting secret ${key}:`, error);
    throw error;
  }
}

// Files & Knowledge Bases Commands
export async function listFiles(): Promise<ManagedFile[]> {
  try {
    return await FileService.listFiles();
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

export async function uploadFile(filePath: string, fileName: string): Promise<ManagedFile> {
  try {
    return await FileService.uploadFile(filePath, fileName);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  try {
    return await FileService.deleteFile(fileId);
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    throw error;
  }
}

export async function createKnowledgeBase(
  name: string,
  description: string,
  embeddingModel: string
): Promise<KnowledgeBase> {
  try {
    return await KnowledgeService.createKnowledgeBase(name, description, embeddingModel);
  } catch (error) {
    console.error("Error creating knowledge base:", error);
    throw error;
  }
}

export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  try {
    return await KnowledgeService.listKnowledgeBases();
  } catch (error) {
    console.error("Error listing knowledge bases:", error);
    throw error;
  }
}

export async function addFileToKnowledgeBase(kbId: string, fileId: string): Promise<void> {
  try {
    return await KnowledgeService.addFileToKnowledgeBase(kbId, fileId);
  } catch (error) {
    console.error("Error adding file to knowledge base:", error);
    throw error;
  }
}

export async function deleteKnowledgeBase(kbId: string): Promise<void> {
  try {
    return await KnowledgeService.deleteKnowledgeBase(kbId);
  } catch (error) {
    console.error(`Error deleting knowledge base ${kbId}:`, error);
    throw error;
  }
}

// Assistants & Agents Commands
export async function createAssistant(config: AssistantConfig): Promise<Assistant> {
  try {
    return await AssistantService.createAssistant(config);
  } catch (error) {
    console.error("Error creating assistant:", error);
    throw error;
  }
}

export async function listAssistants(): Promise<Assistant[]> {
  try {
    return await AssistantService.listAssistants();
  } catch (error) {
    console.error("Error listing assistants:", error);
    throw error;
  }
}

export async function updateAssistant(
  assistantId: string,
  config: Partial<AssistantConfig>
): Promise<Assistant> {
  try {
    return await AssistantService.updateAssistant(assistantId, config);
  } catch (error) {
    console.error(`Error updating assistant ${assistantId}:`, error);
    throw error;
  }
}

export async function deleteAssistant(assistantId: string): Promise<void> {
  try {
    return await AssistantService.deleteAssistant(assistantId);
  } catch (error) {
    console.error(`Error deleting assistant ${assistantId}:`, error);
    throw error;
  }
}

export async function listAgents(): Promise<Agent[]> {
  try {
    return await AgentService.listAgents();
  } catch (error) {
    console.error("Error listing agents:", error);
    throw error;
  }
}

// Chat Commands
export async function startChatSession(assistantId: string): Promise<ChatSession> {
  try {
    return await ChatService.startChatSession(assistantId);
  } catch (error) {
    console.error("Error starting chat session:", error);
    throw error;
  }
}

export async function sendMessage(sessionId: string, message: MessagePayload): Promise<void> {
  try {
    return await ChatService.sendMessage(sessionId, message.content);
  } catch (error) {
    console.error(`Error sending message to session ${sessionId}:`, error);
    throw error;
  }
}

// Helper function to set CORS headers
function setCORSHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Allow requests from common development origins
  if (origin && (
    origin === "http://localhost:1420" || 
    origin === "http://127.0.0.1:1420" ||
    origin === "http://localhost:5173" ||
    origin === "http://127.0.0.1:5173"
  )) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    // For other origins, allow all (in production, you might want to be more restrictive)
    headers["Access-Control-Allow-Origin"] = "*";
  }
  
  headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  headers["Access-Control-Allow-Credentials"] = "true";
  
  return headers;
}

// HTTP server to handle requests from Tauri
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const origin = request.headers.get("Origin");
  
  console.log(`${method} ${path}`);

  try {
    // Handle CORS preflight requests
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: setCORSHeaders(origin),
        status: 204,
      });
    }

    // Route handling
    if (path === "/api/settings" && method === "GET") {
      const settings = await getAppSettings();
      return new Response(JSON.stringify(settings), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/settings" && method === "POST") {
      const settings = await request.json() as AppSettings;
      await updateAppSettings(settings);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/files" && method === "GET") {
      const files = await listFiles();
      return new Response(JSON.stringify(files), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/files" && method === "POST") {
      const { filePath, fileName } = await request.json();
      const file = await uploadFile(filePath, fileName);
      return new Response(JSON.stringify(file), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/files/") && method === "DELETE") {
      const fileId = path.split("/")[3];
      await deleteFile(fileId);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/knowledge-bases" && method === "GET") {
      const knowledgeBases = await listKnowledgeBases();
      return new Response(JSON.stringify(knowledgeBases), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/knowledge-bases" && method === "POST") {
      const { name, description, embeddingModel } = await request.json();
      const kb = await createKnowledgeBase(name, description, embeddingModel);
      return new Response(JSON.stringify(kb), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/knowledge-bases/add-file" && method === "POST") {
      const { kbId, fileId } = await request.json();
      await addFileToKnowledgeBase(kbId, fileId);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/knowledge-bases/") && method === "DELETE") {
      const kbId = path.split("/")[3];
      await deleteKnowledgeBase(kbId);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/assistants" && method === "GET") {
      const assistants = await listAssistants();
      return new Response(JSON.stringify(assistants), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/assistants" && method === "POST") {
      const config = await request.json() as AssistantConfig;
      const assistant = await createAssistant(config);
      return new Response(JSON.stringify(assistant), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/assistants/") && method === "PUT") {
      const assistantId = path.split("/")[3];
      const config = await request.json() as Partial<AssistantConfig>;
      const assistant = await updateAssistant(assistantId, config);
      return new Response(JSON.stringify(assistant), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/assistants/") && method === "DELETE") {
      const assistantId = path.split("/")[3];
      await deleteAssistant(assistantId);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/agents" && method === "GET") {
      const agents = await listAgents();
      return new Response(JSON.stringify(agents), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/chat/sessions" && method === "POST") {
      const { assistantId } = await request.json();
      const session = await startChatSession(assistantId);
      return new Response(JSON.stringify(session), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/chat/sessions/") && method === "POST") {
      const sessionId = path.split("/")[4];
      const { message } = await request.json();
      await sendMessage(sessionId, message);
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    // Provider API endpoints
    if (path.startsWith("/api/providers/") && path.endsWith("/test") && method === "POST") {
      const providerId = path.split("/")[3];
      const success = await ProviderService.testConnection(providerId);
      return new Response(JSON.stringify({ success }), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/providers/") && path.endsWith("/models") && method === "GET") {
      const providerId = path.split("/")[3];
      const models = await ProviderService.listAvailableModels(providerId);
      return new Response(JSON.stringify(models), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/providers/") && path.endsWith("/config") && method === "GET") {
      const providerId = path.split("/")[3];
      const config = await ProviderService.getProviderConfig(providerId);
      return new Response(JSON.stringify(config), {
        headers: setCORSHeaders(origin),
      });
    }

    // MCP API endpoints
    if (path === "/api/mcp-servers" && method === "GET") {
      const settings = await SettingsService.getAppSettings();
      const servers = settings.mcpServers || [];
      return new Response(JSON.stringify(servers), {
        headers: setCORSHeaders(origin),
      });
    }

    if (path === "/api/mcp-servers" && method === "POST") {
      const server = await request.json();
      const settings = await SettingsService.getAppSettings();
      const servers = settings.mcpServers || [];
      
      // Add the new server
      servers.push({
        ...server,
        id: Date.now(), // Simple ID generation
      });
      
      // Update settings
      await SettingsService.updateAppSettings({
        ...settings,
        mcpServers: servers,
      });
      
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/mcp-servers/") && method === "PUT") {
      const serverId = parseInt(path.split("/")[3]);
      const updates = await request.json();
      const settings = await SettingsService.getAppSettings();
      const servers = settings.mcpServers || [];
      
      // Find and update the server
      const index = servers.findIndex((s: any) => s.id === serverId);
      if (index !== -1) {
        servers[index] = { ...servers[index], ...updates };
        
        // Update settings
        await SettingsService.updateAppSettings({
          ...settings,
          mcpServers: servers,
        });
      }
      
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/mcp-servers/") && method === "DELETE") {
      const serverId = parseInt(path.split("/")[3]);
      const settings = await SettingsService.getAppSettings();
      const servers = settings.mcpServers || [];
      
      // Remove the server
      const filteredServers = servers.filter((server: any) => server.id !== serverId);
      
      // Update settings
      await SettingsService.updateAppSettings({
        ...settings,
        mcpServers: filteredServers,
      });
      
      return new Response(null, {
        status: 200,
        headers: setCORSHeaders(origin),
      });
    }

    if (path.startsWith("/api/mcp-servers/") && path.endsWith("/test") && method === "POST") {
      const serverId = parseInt(path.split("/")[3]);
      const settings = await SettingsService.getAppSettings();
      const servers = settings.mcpServers || [];
      
      // Find the server
      const server = servers.find((s: any) => s.id === serverId);
      let success = false;
      
      if (server) {
        // Test connection by making a request to the server's base URL
        try {
          const response = await fetch(`${server.url}/api/tags`);
          success = response.ok;
        } catch (error) {
          console.error(`Error testing MCP server connection for ${serverId}:`, error);
        }
      }
      
      return new Response(JSON.stringify({ success }), {
        headers: setCORSHeaders(origin),
      });
    }

    // Default 404 response
    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: setCORSHeaders(origin),
    });
  }
}

// Initialize the application
async function initializeApp() {
  console.log("Initializing DesktopChat backend...");
  
  try {
    // Load secrets
    await SecretsService.loadSecrets();
    
    // Initialize storage
    await initializeStorage();
    
    // Get settings
    const settings = await SettingsService.getAppSettings();
    
    console.log(`Data directory: ${settings.dataDirectory}`);
    console.log(`Qdrant URL: ${settings.qdrantUrl}`);
    console.log("Backend initialization complete.");
  } catch (error) {
    console.error("Error during backend initialization:", error);
    throw error;
  }
}

// Initialize storage and start the HTTP server
console.log("Starting DesktopChat Deno backend server on http://localhost:8000");
try {
  await initializeApp();
  serve(handleRequest, { port: 8000 });
} catch (error) {
  if (error instanceof Deno.errors.AddrInUse) {
    console.error("Failed to start DesktopChat backend server: Port 8000 is already in use.");
    console.error("Please ensure no other instance is running and try again.");
  } else {
    console.error("Failed to start DesktopChat backend server:", error);
  }
  Deno.exit(1);
}