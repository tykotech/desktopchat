// src/api/mcp.ts
import { invoke } from "@tauri-apps/api/core";

export interface MCPServer {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
}

// MCP API functions
export async function listMcpServers(): Promise<MCPServer[]> {
  try {
    return await invoke<MCPServer[]>("list_mcp_servers");
  } catch (error) {
    console.error("Error listing MCP servers:", error);
    return [];
  }
}

export async function addMcpServer(server: Omit<MCPServer, "id">): Promise<void> {
  try {
    // Generate a temporary ID for the new server
    const serverWithId = {
      ...server,
      id: Date.now()
    };
    await invoke<void>("add_mcp_server", { server: serverWithId });
  } catch (error) {
    console.error("Error adding MCP server:", error);
    throw error;
  }
}

export async function updateMcpServer(serverId: number, updates: Partial<MCPServer>): Promise<void> {
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