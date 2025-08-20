// src/api/files.ts
import { invoke } from '@tauri-apps/api/core';
import type { ManagedFile } from '../../src-deno/main.ts';

export type { ManagedFile };

export const listFiles = (): Promise<ManagedFile[]> => {
  return invoke<ManagedFile[]>('listFiles');
};

export const uploadFile = (
  filePath: string,
  fileName: string
): Promise<ManagedFile> => {
  return invoke<ManagedFile>('uploadFile', { filePath, fileName });
};

export const deleteFile = (fileId: string): Promise<void> => {
  return invoke('deleteFile', { fileId });
};