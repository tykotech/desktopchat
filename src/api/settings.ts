// src/api/settings.ts
import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '@src-deno/main.ts';
import type { ModelInfo } from '@src-deno/services/provider_service.ts';

export type { AppSettings, ModelInfo };

export const getAppSettings = (): Promise<AppSettings> => {
  return invoke<AppSettings>('getAppSettings');
};

export const updateAppSettings = (settings: AppSettings): Promise<void> => {
  return invoke('updateAppSettings', { settings });
};

export const getSecret = (key: string): Promise<string | null> => {
  return invoke<string | null>('getSecret', { key });
};

export const setSecret = (key: string, value: string): Promise<void> => {
  return invoke('setSecret', { key, value });
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