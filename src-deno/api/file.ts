// src-deno/api/file.ts
export interface ManagedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  status: string;
  createdAt: string;
}