// src-deno/db/database_manager.ts
import { SqliteClient } from "./sqlite_client.ts";
import { join } from "@std/path";
import { SettingsService } from "../services/settings_service.ts";

export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private sqliteClient: SqliteClient | null = null;
  private dbPath: string = "./data/app.db";

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async getSqliteClient(): Promise<SqliteClient> {
    if (!this.sqliteClient) {
      // Get the data directory from settings
      try {
        const settings = await SettingsService.getAppSettings();
        this.dbPath = join(settings.dataDirectory, "app.db");
      } catch (e) {
        console.warn("Could not get settings, using default db path:", e);
      }
      
      console.log(`Initializing SQLite database at: ${this.dbPath}`);
      this.sqliteClient = new SqliteClient(this.dbPath);
    }
    return this.sqliteClient;
  }

  close(): void {
    if (this.sqliteClient) {
      this.sqliteClient.close();
      this.sqliteClient = null;
    }
    DatabaseManager.instance = null;
  }
}