// src-deno/services/settings_service.ts
import { AppSettings } from "../api/settings.ts";
import { FileStorage } from "./file_storage.ts";
import * as path from "@std/path";
import { SqliteStorageClient } from "../db/sqlite_storage_client.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import { join } from "@std/path";

export class SettingsService {
  
  static async getAppSettings(): Promise<AppSettings> {
    const fileStorage = FileStorageClient.getInstance();
    const settingsRecord = await fileStorage.getAppSettings();
    
    // Return default settings with any saved overrides
    return {
      // General settings
      theme: settingsRecord?.theme || "dark",
      language: settingsRecord?.language || "en",
      username: settingsRecord?.username || "User",
      fontSize: settingsRecord?.fontSize || "medium",
      autoSave: settingsRecord?.autoSave !== undefined ? settingsRecord.autoSave === "true" : true,
      notifications: settingsRecord?.notifications !== undefined ? settingsRecord.notifications === "true" : true,
      autoUpdate: settingsRecord?.autoUpdate !== undefined ? settingsRecord.autoUpdate === "true" : true,
      dataCollection: settingsRecord?.dataCollection !== undefined ? settingsRecord.dataCollection === "true" : false,
      
      // Model settings
      defaultChatModel: settingsRecord?.defaultChatModel || "gpt-4",
      defaultEmbeddingModel: settingsRecord?.defaultEmbeddingModel || "text-embedding-3-small",
      temperature: settingsRecord?.temperature !== undefined ? parseFloat(settingsRecord.temperature) : 0.7,
      maxTokens: settingsRecord?.maxTokens !== undefined ? parseInt(settingsRecord.maxTokens) : 2048,
      
      // Provider settings
      configuredProviders: settingsRecord?.configuredProviders ? JSON.parse(settingsRecord.configuredProviders) : [],
      
      // Web search settings
      defaultWebSearchProvider: settingsRecord?.defaultWebSearchProvider || "brave",
      braveApiKey: settingsRecord?.braveApiKey,
      googleApiKey: settingsRecord?.googleApiKey,
      googleCseId: settingsRecord?.googleCseId,
      serpApiKey: settingsRecord?.serpApiKey,
      
      // Data settings
      qdrantUrl: settingsRecord?.qdrantUrl || "http://localhost:6333",
      qdrantApiKey: settingsRecord?.qdrantApiKey,
      dataDirectory: settingsRecord?.dataDirectory || join(Deno.cwd(), "data"),
      
      // MCP settings
      mcpServers: settingsRecord?.mcpServers ? JSON.parse(settingsRecord.mcpServers) : [
        { id: 1, name: "Local Ollama", url: "http://localhost:11434", enabled: true }
      ]
    };
  }

  static async updateAppSettings(settings: AppSettings): Promise<void> {
    // Convert settings to record format for storage
    const settingsRecord: Record<string, string> = {
      theme: settings.theme,
      language: settings.language,
      username: settings.username,
      fontSize: settings.fontSize,
      autoSave: settings.autoSave.toString(),
      notifications: settings.notifications.toString(),
      autoUpdate: settings.autoUpdate.toString(),
      dataCollection: settings.dataCollection.toString(),
      defaultChatModel: settings.defaultChatModel,
      defaultEmbeddingModel: settings.defaultEmbeddingModel,
      temperature: settings.temperature.toString(),
      maxTokens: settings.maxTokens.toString(),
      configuredProviders: JSON.stringify(settings.configuredProviders),
      defaultWebSearchProvider: settings.defaultWebSearchProvider,
      qdrantUrl: settings.qdrantUrl,
      dataDirectory: settings.dataDirectory,
      mcpServers: JSON.stringify(settings.mcpServers)
    };
    
    // Add optional fields if they exist
    if (settings.braveApiKey) settingsRecord.braveApiKey = settings.braveApiKey;
    if (settings.googleApiKey) settingsRecord.googleApiKey = settings.googleApiKey;
    if (settings.googleCseId) settingsRecord.googleCseId = settings.googleCseId;
    if (settings.serpApiKey) settingsRecord.serpApiKey = settings.serpApiKey;
    if (settings.qdrantApiKey) settingsRecord.qdrantApiKey = settings.qdrantApiKey;
    
    const fileStorage = FileStorageClient.getInstance();
    await fileStorage.updateAppSettings(settingsRecord);
  }
  
  static async updateSetting(key: string, value: any): Promise<void> {
    const settings = await this.getAppSettings();
    (settings as any)[key] = value;
    await this.updateAppSettings(settings);
  }
}