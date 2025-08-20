// src/api/providers.ts
import { invoke } from "@tauri-apps/api/core";

// Provider API functions
export async function testProviderConnection(providerId: string): Promise<boolean> {
  try {
    const response = await invoke<{ success: boolean }>("test_provider_connection", { providerId });
    return response.success;
  } catch (error) {
    console.error(`Error testing provider connection for ${providerId}:`, error);
    return false;
  }
}

export async function listProviderModels(providerId: string): Promise<any[]> {
  try {
    return await invoke<any[]>("list_provider_models", { providerId });
  } catch (error) {
    console.error(`Error listing models for provider ${providerId}:`, error);
    return [];
  }
}

export async function getProviderConfig(providerId: string): Promise<any> {
  try {
    return await invoke<any>("get_provider_config", { providerId });
  } catch (error) {
    console.error(`Error getting provider config for ${providerId}:`, error);
    return null;
  }
}

// MCP API functions
export async function listMcpServers(): Promise<any[]> {
  try {
    return await invoke<any[]>("list_mcp_servers");
  } catch (error) {
    console.error("Error listing MCP servers:", error);
    return [];
  }
}

export async function addMcpServer(server: any): Promise<void> {
  try {
    await invoke<void>("add_mcp_server", { server });
  } catch (error) {
    console.error("Error adding MCP server:", error);
    throw error;
  }
}

export async function updateMcpServer(serverId: number, updates: Partial<any>): Promise<void> {
  try {
    await invoke<void>("update_mcp_server", { serverId, updates });
  } catch (error) {
    console.error(`Error updating MCP server ${serverId}:`, error);
    throw error;
  }
}

export async function removeMcpServer(serverId: number): Promise<void> {
  try {
    await invoke<void>("remove_mcp_server", { serverId });
  } catch (error) {
    console.error(`Error removing MCP server ${serverId}:`, error);
    throw error;
  }
}

export async function testMcpServerConnection(serverId: number): Promise<boolean> {
  try {
    const response = await invoke<{ success: boolean }>("test_mcp_server_connection", { serverId });
    return response.success;
  } catch (error) {
    console.error(`Error testing MCP server connection for ${serverId}:`, error);
    return false;
  }
}