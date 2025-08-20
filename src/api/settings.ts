// src/api/settings.ts
import { AppSettings } from '../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const getAppSettings = (): Promise<AppSettings> => {
  return executeSidecarCommand<AppSettings>('getAppSettings');
};

export const updateAppSettings = (settings: AppSettings): Promise<void> => {
  return executeSidecarCommand('updateAppSettings', [settings]);
};

export const getSecret = (key: string): Promise<string | null> => {
  return executeSidecarCommand<string | null>('getSecret', [key]);
};

export const setSecret = (key: string, value: string): Promise<void> => {
  return executeSidecarCommand('setSecret', [key, value]);
};

// Provider-specific functions
export const testProviderConnection = (providerId: string): Promise<boolean> => {
  return executeSidecarCommand<boolean>('testProviderConnection', [providerId]);
};

export const listProviderModels = (providerId: string): Promise<any[]> => {
  return executeSidecarCommand<any[]>('listProviderModels', [providerId]);
};

export const getProviderConfig = (providerId: string): Promise<any> => {
  return executeSidecarCommand<any>('getProviderConfig', [providerId]);
};