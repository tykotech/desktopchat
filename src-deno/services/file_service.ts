// src-deno/services/file_service.ts
import { ManagedFile } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import * as path from "@std/path";
import { lookup } from "@std/media-types";
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
    const filesDir = path.join(dataDir, "files");
    
    // Ensure the files directory exists
    await Deno.mkdir(filesDir, { recursive: true });
    
    // Copy the file to the app's data directory
    const destinationPath = path.join(filesDir, `${fileId}_${fileName}`);
    await Deno.copyFile(filePath, destinationPath);
    
    // Get file stats
    const fileInfo = await Deno.stat(filePath);
    const fileSize = fileInfo.size;
    
    // Determine MIME type using extension lookup
    const ext = path.extname(fileName).toLowerCase();
    const mimeType = lookup(ext) || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
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