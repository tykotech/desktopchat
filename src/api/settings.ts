// src/api/settings.ts
import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '@src-deno/main.ts';

export type { AppSettings };

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