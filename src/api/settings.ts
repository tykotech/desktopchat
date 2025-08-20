// src/api/settings.ts
import { invoke } from '@tauri-apps/api/core';
export interface AppSettings {
  [key: string]: unknown;
}
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: 'chat' | 'embedding';
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'api' | 'local';
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
}

export type { AppSettings, ModelInfo, ProviderConfig };

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

// Provider-specific functions
export const testProviderConnection = (providerId: string): Promise<boolean> => {
  return invoke<boolean>('testProviderConnection', { providerId });
};

export const listProviderModels = (
  providerId: string
): Promise<ModelInfo[]> => {
  return invoke<ModelInfo[]>('listProviderModels', { providerId });
};

export const getProviderConfig = (
  providerId: string
): Promise<ProviderConfig> => {
  return invoke<ProviderConfig>('get_provider_config', { providerId });
};