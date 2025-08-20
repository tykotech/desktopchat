// src-deno/services/file_service.ts
import { ManagedFile } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import * as path from "@std/path";
import { SettingsService } from "./settings_service.ts";

export class FileService {
  
  static async listFiles(): Promise<ManagedFile[]> {
    const fileStorage = FileStorageClient.getInstance();
    return await fileStorage.listFiles();
  }

  static async uploadFile(filePath: string, fileName: string): Promise<ManagedFile> {
    const fileId = generateUUID();
    
    // Get the data directory from settings
    const settings = await SettingsService.getAppSettings();
    const dataDir = settings.dataDirectory;
    const filesDir = join(dataDir, "files");
    
    // Ensure the files directory exists
    await Deno.mkdir(filesDir, { recursive: true });
    
    // Copy the file to the app's data directory
    const destinationPath = join(filesDir, `${fileId}_${fileName}`);
    await Deno.copyFile(filePath, destinationPath);
    
    // Get file stats
    const fileInfo = await Deno.stat(filePath);
    const fileSize = fileInfo.size;
    
    // Determine MIME type
    let mimeType = "application/octet-stream";
    if (fileName.endsWith(".txt")) {
      mimeType = "text/plain";
    } else if (fileName.endsWith(".pdf")) {
      mimeType = "application/pdf";
    } else if (fileName.endsWith(".md")) {
      mimeType = "text/markdown";
    }
    
    const file: ManagedFile = {
      id: fileId,
      name: fileName,
      path: destinationPath,
      size: fileSize,
      mimeType: mimeType,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    // Save to file storage
    const fileStorage = FileStorageClient.getInstance();
    await fileStorage.createFile({ ...file, id: fileId });
    
    return file;
  }

  static async deleteFile(fileId: string): Promise<void> {
    const fileStorage = FileStorageClient.getInstance();
    
    // Get the file to delete
    const file = await fileStorage.getFile(fileId);
    if (file) {
      // Delete the actual file from the filesystem
      try {
        await Deno.remove(file.path);
      } catch (error) {
        console.warn(`Failed to delete file from filesystem: ${file.path}`, error);
      }
    }
    
    // Delete from storage
    await fileStorage.deleteFile(fileId);
  }
}