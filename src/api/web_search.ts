// src/api/web_search.ts
import { invoke } from '@tauri-apps/api/core';

export const testWebSearchConnection = (provider: string): Promise<boolean> => {
  return invoke<boolean>('testWebSearchConnection', { provider });
};
