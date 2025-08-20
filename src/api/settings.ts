// src/api/settings.ts
import { invoke } from '@tauri-apps/api/core';
export interface AppSettings {
  theme: string;
  language: string;
  username: string;
  fontSize: string;
  autoSave: boolean;
  notifications: boolean;
  autoUpdate: boolean;
  dataCollection: boolean;
  defaultChatModel: string;
  defaultEmbeddingModel: string;
  temperature: number;
  maxTokens: number;
  configuredProviders: string[];
  defaultWebSearchProvider: string;
  braveApiKey?: string;
  googleApiKey?: string;
  googleCseId?: string;
  serpApiKey?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: 'chat' | 'embedding';
}

export const getAppSettings = (): Promise<AppSettings> => {
  return invoke<AppSettings>('getAppSettings');
};

export const updateAppSettings = (settings: AppSettings): Promise<void> => {
  return invoke('updateAppSettings', { settings });
};

export const getSecret = (key: string): Promise<string | null> => {
  return invoke<string | null>('get_secret', { key });
};

export const setSecret = (key: string, value: string): Promise<void> => {

  return invoke('set_secret', { key, value });
};

export const deleteSecret = (key: string): Promise<void> => {
  return invoke('delete_secret', { key });
};

export const testQdrantConnection = (
  qdrantUrl: string,
  qdrantApiKey?: string
): Promise<boolean> => {
  return invoke<boolean>('test_qdrant_connection', {
    qdrantUrl,
    qdrantApiKey,
  });
};

// Provider-specific functions
export const testProviderConnection = (providerId: string): Promise<boolean> => {
  return invoke<boolean>('testProviderConnection', { providerId });
};

export const listProviderModels = (
  providerId: string
): Promise<ModelInfo[]> => {
  return invoke<ModelInfo[]>('listProviderModels', { providerId });
};

export const getProviderConfig = (providerId: string): Promise<any> => {
  return invoke<any>('getProviderConfig', { providerId });
};

export const testWebSearchProvider = (provider: string): Promise<boolean> => {
  return invoke<boolean>('testWebSearchProvider', { provider });

};