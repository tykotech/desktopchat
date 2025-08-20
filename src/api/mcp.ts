// src/api/mcp.ts
import { core } from '@tauri-apps/api';
import type { MCPServer } from './types';

export const listMcpServers = (): Promise<MCPServer[]> => {
  return core.invoke('listMcpServers');
};

export const addMcpServer = (server: Omit<MCPServer, 'id'>): Promise<void> => {
  return core.invoke('addMcpServer', { server });
};

export const updateMcpServer = (serverId: number, updates: Partial<MCPServer>): Promise<void> => {
  return core.invoke('updateMcpServer', { serverId, updates });
};

export const removeMcpServer = (serverId: number): Promise<void> => {
  return core.invoke('removeMcpServer', { serverId });
};

export const testMcpServerConnection = (url: string): Promise<boolean> => {
  return core.invoke('testMcpServerConnection', { url });
};