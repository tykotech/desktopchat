// src/api/providers.ts
import { invoke } from '@tauri-apps/api/core';
import type { ModelInfo, ProviderConfig } from '@src-deno/services/provider_service.ts';

export type { ModelInfo, ProviderConfig };

export const testProviderConnection = (providerId: string): Promise<boolean> => {
  return invoke<boolean>('testProviderConnection', { providerId });
};

export const listProviderModels = (
  providerId: string,
): Promise<ModelInfo[]> => {
  return invoke<ModelInfo[]>('listProviderModels', { providerId });
};

export const getProviderConfig = (
  providerId: string,
): Promise<ProviderConfig | null> => {
  return invoke<ProviderConfig | null>('getProviderConfig', { providerId });
};
