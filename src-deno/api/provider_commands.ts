// src-deno/api/provider_commands.ts
import { testProviderConnection, listAvailableModels, getProviderConfig } from "../services/provider_service.ts";
import { SettingsService } from "../services/settings_service.ts";

// Provider API command implementations
export async function testProviderConnectionCommand(providerId: string): Promise<{ success: boolean }> {
  try {
    const success = await testProviderConnection(providerId);
    return { success };
  } catch (error) {
    console.error(`Error testing provider connection for ${providerId}:`, error);
    return { success: false };
  }
}

export async function listProviderModelsCommand(providerId: string): Promise<any[]> {
  try {
    return await listAvailableModels(providerId);
  } catch (error) {
    console.error(`Error listing models for provider ${providerId}:`, error);
    return [];
  }
}

export async function getProviderConfigCommand(providerId: string): Promise<any> {
  try {
    return await getProviderConfig(providerId);
  } catch (error) {
    console.error(`Error getting provider config for ${providerId}:`, error);
    return null;
  }
}

// MCP API command implementations
export async function listMcpServersCommand(): Promise<any[]> {
  try {
    const settings = await SettingsService.getAppSettings();
    return settings.mcpServers || [];
  } catch (error) {
    console.error("Error listing MCP servers:", error);
    return [];
  }
}

export async function addMcpServerCommand(server: any): Promise<void> {
  try {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    
    // Add the new server
    mcpServers.push({
      ...server,
      id: Date.now(), // Simple ID generation
    });
    
    // Update settings
    await SettingsService.updateAppSettings({
      ...settings,
      mcpServers,
    });
  } catch (error) {
    console.error("Error adding MCP server:", error);
    throw error;
  }
}

export async function updateMcpServerCommand(serverId: number, updates: Partial<any>): Promise<void> {
  try {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    
    // Find and update the server
    const index = mcpServers.findIndex((server: any) => server.id === serverId);
    if (index !== -1) {
      mcpServers[index] = { ...mcpServers[index], ...updates };
      
      // Update settings
      await SettingsService.updateAppSettings({
        ...settings,
        mcpServers,
      });
    }
  } catch (error) {
    console.error(`Error updating MCP server ${serverId}:`, error);
    throw error;
  }
}

export async function removeMcpServerCommand(serverId: number): Promise<void> {
  try {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    
    // Remove the server
    const filteredServers = mcpServers.filter((server: any) => server.id !== serverId);
    
    // Update settings
    await SettingsService.updateAppSettings({
      ...settings,
      mcpServers: filteredServers,
    });
  } catch (error) {
    console.error(`Error removing MCP server ${serverId}:`, error);
    throw error;
  }
}

export async function testMcpServerConnectionCommand(serverId: number): Promise<{ success: boolean }> {
  try {
    const settings = await SettingsService.getAppSettings();
    const mcpServers = settings.mcpServers || [];
    
    // Find the server
    const server = mcpServers.find((s: any) => s.id === serverId);
    if (!server) {
      return { success: false };
    }
    
    // Test connection by making a request to the server's base URL
    try {
      const response = await fetch(`${server.url}/api/tags`);
      return { success: response.ok };
    } catch (error) {
      console.error(`Error testing MCP server connection for ${serverId}:`, error);
      return { success: false };
    }
  } catch (error) {
    console.error(`Error testing MCP server connection for ${serverId}:`, error);
    return { success: false };
  }
}