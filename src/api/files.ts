// src/api/files.ts
import { ManagedFile } from '../../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const listFiles = (): Promise<ManagedFile[]> => {
  return executeSidecarCommand<ManagedFile[]>('listFiles');
};

export const uploadFile = (filePath: string, fileName: string): Promise<ManagedFile> => {
  return executeSidecarCommand<ManagedFile>('uploadFile', [filePath, fileName]);
};

export const deleteFile = (fileId: string): Promise<void> => {
  return executeSidecarCommand('deleteFile', [fileId]);
};