// src-deno/services/chat_service.ts
import { ChatSession, ChatMessage } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { executeRagPipeline } from "../core/rag_pipeline.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";

export class ChatService {

  static async startChatSession(assistantId: string): Promise<ChatSession> {
    const sessionId = generateUUID();
    
    const session: ChatSession = {
      id: sessionId,
      assistantId,
      title: "New Chat",
      createdAt: new Date().toISOString()
    };

    // Save to file storage
    const fileStorage = FileStorageClient.getInstance();
    await fileStorage.createChatSession({ ...session, id: sessionId });
    
    return session;
  }

  static async sendMessage(sessionId: string, content: string): Promise<void> {
    // This would trigger the RAG pipeline
    await executeRagPipeline(sessionId, content);
  }
}