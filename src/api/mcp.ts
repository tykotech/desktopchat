// src/api/mcp.ts
import { getAppSettings, updateAppSettings } from './settings';
import { executeSidecarCommand } from './sidecar';
import { MCPServer } from '../../src-deno/main';

export const listMcpServers = async (): Promise<MCPServer[]> => {
  const settings = await getAppSettings();
  return settings.mcpServers || [];
};

export const addMcpServer = async (server: Omit<MCPServer, 'id'>): Promise<void> => {
  const settings = await getAppSettings();
  const newServer = { ...server, id: Date.now() };
  const mcpServers = [...(settings.mcpServers || []), newServer];
  await updateAppSettings({ ...settings, mcpServers });
};

export const updateMcpServer = async (serverId: number, updates: Partial<MCPServer>): Promise<void> => {
  const settings = await getAppSettings();
  const mcpServers = (settings.mcpServers || []).map(s => s.id === serverId ? { ...s, ...updates } : s);
  await updateAppSettings({ ...settings, mcpServers });
};

export const removeMcpServer = async (serverId: number): Promise<void> => {
  const settings = await getAppSettings();
  const mcpServers = (settings.mcpServers || []).filter(s => s.id !== serverId);
  await updateAppSettings({ ...settings, mcpServers });
};

export const testMcpServerConnection = (url: string): Promise<boolean> => {
  return executeSidecarCommand<boolean>('testMcpServerConnection', [url]);
};