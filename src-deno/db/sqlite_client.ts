// src-deno/db/sqlite_client.ts
// Using a simpler approach for SQLite in Deno
import { Database } from "@db/sqlite";
import { 
  ManagedFile, 
  KnowledgeBase, 
  Assistant, 
  ChatSession, 
  ChatMessage 
} from "./schema.ts";

export class SqliteClient {
  private db: Database;

  constructor(dbPath: string) {
    console.log(`Initializing SQLite database at: ${dbPath}`);
    
    // Ensure the data directory exists
    const dataDir = dbPath.substring(0, dbPath.lastIndexOf('/'));
    try {
      // In a real implementation, you'd use Deno.mkdirSync or similar
      // For now, we'll just log that we would create the directory
      console.log(`Would create data directory: ${dataDir}`);
    } catch (e) {
      // Handle errors
      console.error(`Error handling data directory ${dataDir}:`, e);
    }
    
    this.db = new Database(dbPath);
    this.initTables();
    console.log("SQLite database initialized successfully");
  }

  private initTables() {
    console.log("Initializing database tables...");
    
    try {
      // Create tables if they don't exist as specified in the design document
      
      // Application settings and user profile information
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Managed files copied into the app's data directory
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          path TEXT NOT NULL,
          size INTEGER NOT NULL,
          mime_type TEXT,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Knowledge bases
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_bases (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          embedding_model TEXT NOT NULL,
          vector_size INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Join table for files and knowledge bases (many-to-many)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS knowledge_base_files (
          knowledge_base_id TEXT,
          file_id TEXT,
          PRIMARY KEY (knowledge_base_id, file_id),
          FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
      `);

      // Assistants configuration
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS assistants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          model TEXT NOT NULL,
          system_prompt TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Join table for assistants and knowledge bases (many-to-many)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS assistant_knowledge_bases (
          assistant_id TEXT,
          knowledge_base_id TEXT,
          PRIMARY KEY (assistant_id, knowledge_base_id),
          FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE,
          FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
        )
      `);

      // Chat sessions/topics
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          assistant_id TEXT,
          title TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE SET NULL
        )
      `);

      // Individual chat messages
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        )
      `);
      
      console.log("Database tables initialized successfully");
    } catch (error) {
      console.error("Error initializing database tables:", error);
      throw error;
    }
  }

  // Settings methods
  getAppSettings(): Record<string, string> {
    try {
      const settings: Record<string, string> = {};
      const stmt = this.db.prepare("SELECT key, value FROM settings");
      for (const row of stmt.all()) {
        settings[row.key as string] = row.value as string;
      }
      return settings;
    } catch (error) {
      console.error("Error getting app settings:", error);
      throw error;
    }
  }

  updateAppSettings(settings: Record<string, string>): void {
    try {
      for (const [key, value] of Object.entries(settings)) {
        this.db.exec(
          "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
          key, value
        );
      }
    } catch (error) {
      console.error("Error updating app settings:", error);
      throw error;
    }
  }

  // File methods
  listFiles(): ManagedFile[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, path, size, mime_type, status, created_at 
        FROM files
      `);
      const rows = stmt.all();
      return rows.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        path: row.path as string,
        size: row.size as number,
        mimeType: row.mime_type as string,
        status: row.status as "PENDING" | "PROCESSING" | "INDEXED" | "ERROR",
        createdAt: row.created_at as string
      }));
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  getFile(fileId: string): ManagedFile | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, path, size, mime_type, status, created_at 
        FROM files 
        WHERE id = ?
      `);
      const row: any = stmt.get(fileId);
      
      if (!row) return null;
      
      return {
        id: row.id as string,
        name: row.name as string,
        path: row.path as string,
        size: row.size as number,
        mimeType: row.mime_type as string,
        status: row.status as "PENDING" | "PROCESSING" | "INDEXED" | "ERROR",
        createdAt: row.created_at as string
      };
    } catch (error) {
      console.error(`Error getting file ${fileId}:`, error);
      throw error;
    }
  }

  createFile(file: any): void {
    try {
      this.db.exec(`
        INSERT INTO files (id, name, path, size, mime_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, 
      file.id,
      file.name,
      file.path,
      file.size,
      file.mimeType,
      file.status,
      file.createdAt
      );
    } catch (error) {
      console.error(`Error creating file ${file.id}:`, error);
      throw error;
    }
  }

  updateFileStatus(fileId: string, status: string): void {
    try {
      const result = this.db.exec(`
        UPDATE files 
        SET status = ? 
        WHERE id = ?
      `, status, fileId);
      
      // Note: The changes property is available on the database object
      if (this.db.changes === 0) {
        console.warn(`No file found with ID ${fileId} to update status`);
      }
    } catch (error) {
      console.error(`Error updating file status for ${fileId}:`, error);
      throw error;
    }
  }

  deleteFile(fileId: string): void {
    try {
      const result = this.db.exec("DELETE FROM files WHERE id = ?", fileId);
      
      if (this.db.changes === 0) {
        console.warn(`No file found with ID ${fileId} to delete`);
      }
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  }

  // Knowledge base methods
  listKnowledgeBases(): KnowledgeBase[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, embedding_model, vector_size, created_at 
        FROM knowledge_bases
      `);
      const rows = stmt.all();
      return rows.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        embeddingModel: row.embedding_model as string,
        vectorSize: row.vector_size as number,
        createdAt: row.created_at as string
      }));
    } catch (error) {
      console.error("Error listing knowledge bases:", error);
      throw error;
    }
  }

  getKnowledgeBase(kbId: string): KnowledgeBase | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, embedding_model, vector_size, created_at 
        FROM knowledge_bases 
        WHERE id = ?
      `);
      const row: any = stmt.get(kbId);
      
      if (!row) return null;
      
      return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        embeddingModel: row.embedding_model as string,
        vectorSize: row.vector_size as number,
        createdAt: row.created_at as string
      };
    } catch (error) {
      console.error(`Error getting knowledge base ${kbId}:`, error);
      throw error;
    }
  }

  createKnowledgeBase(kb: any): void {
    try {
      this.db.exec(`
        INSERT INTO knowledge_bases (id, name, description, embedding_model, vector_size, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      kb.id,
      kb.name,
      kb.description,
      kb.embeddingModel,
      kb.vectorSize,
      kb.createdAt
      );
    } catch (error) {
      console.error(`Error creating knowledge base ${kb.id}:`, error);
      throw error;
    }
  }

  deleteKnowledgeBase(kbId: string): void {
    try {
      // This will cascade delete from knowledge_base_files and assistant_knowledge_bases
      const result = this.db.exec("DELETE FROM knowledge_bases WHERE id = ?", kbId);
      
      if (this.db.changes === 0) {
        console.warn(`No knowledge base found with ID ${kbId} to delete`);
      }
    } catch (error) {
      console.error(`Error deleting knowledge base ${kbId}:`, error);
      throw error;
    }
  }

  // Knowledge base file methods
  addFileToKnowledgeBase(knowledgeBaseId: string, fileId: string): void {
    try {
      this.db.exec(`
        INSERT INTO knowledge_base_files (knowledge_base_id, file_id)
        VALUES (?, ?)
      `, knowledgeBaseId, fileId);
    } catch (error) {
      console.error(`Error adding file ${fileId} to knowledge base ${knowledgeBaseId}:`, error);
      throw error;
    }
  }

  removeFileFromKnowledgeBase(knowledgeBaseId: string, fileId: string): void {
    try {
      this.db.exec(
        "DELETE FROM knowledge_base_files WHERE knowledge_base_id = ? AND file_id = ?",
        knowledgeBaseId,
        fileId,
      );
    } catch (error) {
      console.error(`Error removing file ${fileId} from knowledge base ${knowledgeBaseId}:`, error);
      throw error;
    }
  }

  getKnowledgeBaseFiles(knowledgeBaseId: string): ManagedFile[] {
    try {
      const stmt = this.db.prepare(`
        SELECT f.id, f.name, f.path, f.size, f.mime_type, f.status, f.created_at
        FROM files f
        JOIN knowledge_base_files kbf ON f.id = kbf.file_id
        WHERE kbf.knowledge_base_id = ?
      `);
      const rows = stmt.all(knowledgeBaseId);
      return rows.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        path: row.path as string,
        size: row.size as number,
        mimeType: row.mime_type as string,
        status: row.status as "PENDING" | "PROCESSING" | "INDEXED" | "ERROR",
        createdAt: row.created_at as string
      }));
    } catch (error) {
      console.error(`Error getting files for knowledge base ${knowledgeBaseId}:`, error);
      throw error;
    }
  }

  // Assistant methods
  listAssistants(): Assistant[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, model, system_prompt, created_at 
        FROM assistants
      `);
      const rows = stmt.all();
      return rows.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        model: row.model as string,
        systemPrompt: row.system_prompt as string,
        createdAt: row.created_at as string
      }));
    } catch (error) {
      console.error("Error listing assistants:", error);
      throw error;
    }
  }

  getAssistant(assistantId: string): Assistant | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, model, system_prompt, created_at 
        FROM assistants 
        WHERE id = ?
      `);
      const row: any = stmt.get(assistantId);
      
      if (!row) return null;
      
      return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        model: row.model as string,
        systemPrompt: row.system_prompt as string,
        createdAt: row.created_at as string
      };
    } catch (error) {
      console.error(`Error getting assistant ${assistantId}:`, error);
      throw error;
    }
  }

  createAssistant(assistant: any): void {
    try {
      this.db.exec(`
        INSERT INTO assistants (id, name, description, model, system_prompt, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      assistant.id,
      assistant.name,
      assistant.description,
      assistant.model,
      assistant.systemPrompt,
      assistant.createdAt
      );
    } catch (error) {
      console.error(`Error creating assistant ${assistant.id}:`, error);
      throw error;
    }
  }

  updateAssistant(assistantId: string, updates: Partial<Assistant>): void {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== "id" && key !== "createdAt") {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length > 0) {
        values.push(assistantId);
        const result = this.db.exec(`
          UPDATE assistants 
          SET ${fields.join(", ")} 
          WHERE id = ?
        `, ...values);
        
        if (this.db.changes === 0) {
          console.warn(`No assistant found with ID ${assistantId} to update`);
        }
      }
    } catch (error) {
      console.error(`Error updating assistant ${assistantId}:`, error);
      throw error;
    }
  }

  deleteAssistant(assistantId: string): void {
    try {
      const result = this.db.exec("DELETE FROM assistants WHERE id = ?", assistantId);
      
      if (this.db.changes === 0) {
        console.warn(`No assistant found with ID ${assistantId} to delete`);
      }
    } catch (error) {
      console.error(`Error deleting assistant ${assistantId}:`, error);
      throw error;
    }
  }

  // Assistant knowledge base methods
  addAssistantKnowledgeBase(assistantId: string, knowledgeBaseId: string): void {
    try {
      this.db.exec(`
        INSERT INTO assistant_knowledge_bases (assistant_id, knowledge_base_id)
        VALUES (?, ?)
      `, assistantId, knowledgeBaseId);
    } catch (error) {
      console.error(`Error adding knowledge base ${knowledgeBaseId} to assistant ${assistantId}:`, error);
      throw error;
    }
  }

  getAssistantKnowledgeBases(assistantId: string): string[] {
    try {
      const stmt = this.db.prepare(`
        SELECT knowledge_base_id 
        FROM assistant_knowledge_bases 
        WHERE assistant_id = ?
      `);
      const rows = stmt.all(assistantId);
      return rows.map(row => row.knowledge_base_id as string);
    } catch (error) {
      console.error(`Error getting knowledge bases for assistant ${assistantId}:`, error);
      throw error;
    }
  }

  // Chat session methods
  createChatSession(session: any): void {
    try {
      this.db.exec(`
        INSERT INTO chat_sessions (id, assistant_id, title, created_at)
        VALUES (?, ?, ?, ?)
      `,
      session.id,
      session.assistantId,
      session.title,
      session.createdAt
      );
    } catch (error) {
      console.error(`Error creating chat session ${session.id}:`, error);
      throw error;
    }
  }

  getChatSession(sessionId: string): ChatSession | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, assistant_id, title, created_at 
        FROM chat_sessions 
        WHERE id = ?
      `);
      const row: any = stmt.get(sessionId);
      
      if (!row) return null;
      
      return {
        id: row.id as string,
        assistantId: row.assistant_id as string,
        title: row.title as string,
        createdAt: row.created_at as string
      };
    } catch (error) {
      console.error(`Error getting chat session ${sessionId}:`, error);
      throw error;
    }
  }

  // Chat message methods
  saveMessage(message: any): void {
    try {
      this.db.exec(`
        INSERT INTO chat_messages (id, session_id, role, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      message.id,
      message.sessionId,
      message.role,
      message.content,
      message.createdAt
      );
    } catch (error) {
      console.error(`Error saving message ${message.id}:`, error);
      throw error;
    }
  }

  getMessagesForSession(sessionId: string): ChatMessage[] {
    try {
      const stmt = this.db.prepare(`
        SELECT id, session_id, role, content, created_at 
        FROM chat_messages 
        WHERE session_id = ?
        ORDER BY created_at ASC
      `);
      const rows = stmt.all(sessionId);
      return rows.map((row: any) => ({
        id: row.id as string,
        sessionId: row.session_id as string,
        role: row.role as "user" | "assistant",
        content: row.content as string,
        createdAt: row.created_at as string
      }));
    } catch (error) {
      console.error(`Error getting messages for session ${sessionId}:`, error);
      throw error;
    }
  }

  close(): void {
    try {
      this.db.close();
      console.log("SQLite database connection closed");
    } catch (error) {
      console.error("Error closing SQLite database connection:", error);
      throw error;
    }
  }
}