// src/api/files.ts
import { core } from '@tauri-apps/api';
import type { ManagedFile } from './types';

export const listFiles = (): Promise<ManagedFile[]> => {
  return core.invoke('listFiles');
};

export const uploadFile = (filePath: string, fileName: string): Promise<ManagedFile> => {
  return core.invoke('uploadFile', { filePath, fileName });
};

export const deleteFile = (fileId: string): Promise<void> => {
  return core.invoke('deleteFile', { fileId });
};