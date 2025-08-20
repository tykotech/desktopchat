// src/api/files.ts
import { ManagedFile } from '../../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const listFiles = async (): Promise<ManagedFile[]> => {
  // In a real implementation:
  // return await invoke('list_files');
  
  // For now, we'll fetch from the HTTP API
  const response = await fetch('http://localhost:8000/api/files');
  return await response.json();
};

export const uploadFile = async (filePath: string, fileName: string): Promise<ManagedFile> => {
  // In a real implementation:
  // return await invoke('upload_file', { filePath, fileName });
  
  // For now, we'll use the HTTP API
  const response = await fetch('http://localhost:8000/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath, fileName }),
  });
  return await response.json();
};

export const deleteFile = async (fileId: string): Promise<void> => {
  // In a real implementation:
  // return await invoke('delete_file', { fileId });
  
  // For now, we'll use the HTTP API
  await fetch(`http://localhost:8000/api/files/${fileId}`, {
    method: 'DELETE',
  });
};