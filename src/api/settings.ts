// src/api/settings.ts
import { core } from '@tauri-apps/api';
import type { AppSettings } from './types';

export const getAppSettings = (): Promise<AppSettings> => {
  return core.invoke('getAppSettings');
};

export const updateAppSettings = (settings: AppSettings): Promise<void> => {
  return core.invoke('updateAppSettings', { settings });
};

export const getSecret = (key: string): Promise<string | null> => {
  return core.invoke('getSecret', { key });
};

export const setSecret = (key: string, value: string): Promise<void> => {
  return core.invoke('setSecret', { key, value });
};

// Provider-specific functions
export const testProviderConnection = (providerId: string): Promise<boolean> => {
  return core.invoke('testProviderConnection', { providerId });
};

export const listProviderModels = (providerId: string): Promise<any[]> => {
  return core.invoke('listProviderModels', { providerId });
};

export const getProviderConfig = (providerId: string): Promise<any> => {
  return core.invoke('getProviderConfig', { providerId });
};