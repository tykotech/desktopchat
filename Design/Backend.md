# Backend Implementation Plan (Deno)

This document provides a detailed implementation plan for the Deno backend of the application. It covers the project structure, API endpoints (Tauri commands), database schema, core logic, and configuration management.

---

## 1. Project Structure (Deno Backend)

The Deno source code will reside in a dedicated `src-deno` directory at the root of the project. This ensures a clean separation from the frontend (`src`) and the Tauri Rust core (`src-tauri`).

```
/
├── src/              # React Frontend Source
├── src-deno/
│   ├── api/          # Type definitions (DTOs) for commands and payloads
│   │   ├── assistant.ts
│   │   ├── chat.ts
│   │   └── settings.ts
│   ├── core/         # Core business logic orchestrators
│   │   ├── file_processor.ts  # Logic for parsing, chunking, and embedding files
│   │   └── rag_pipeline.ts    # Implementation of the RAG pipeline
│   ├── db/           # Database clients and schema definitions
│   │   ├── qdrant_client.ts   # Client for interacting with the Qdrant API
│   │   ├── sqlite_client.ts   # Client and schema setup for SQLite
│   │   └── schema.ts          # Centralized type definitions for DB models
│   ├── lib/          # Wrappers for external services or complex libraries
│   │   └── llm_factory.ts     # Factory for creating clients for different LLM providers
│   ├── services/     # High-level services exposed as commands
│   │   ├── assistant_service.ts
│   │   ├── chat_service.ts
│   │   ├── file_service.ts
│   │   ├── knowledge_service.ts
│   │   └── settings_service.ts
│   ├── util/         # Utility functions (e.g., text splitting, UUID generation)
│   └── main.ts       # Main entry point registering all Tauri commands
└── src-tauri/        # Tauri Rust Core
```

---

## 2. API Endpoints (Tauri Commands)

The frontend will communicate with the Deno backend by invoking commands via the Tauri bridge. These are not HTTP endpoints but are conceptually similar. All commands will be defined in `src-deno/main.ts` and exported for Tauri to consume.

### Command Specification

**Settings**
- `get_app_settings()`: Fetches the entire application configuration.
  - **Returns:** `Promise<AppSettings>`
- `update_app_settings(settings: AppSettings)`: Updates and saves the application configuration.
  - **Args:** `settings` - A complete `AppSettings` object.
  - **Returns:** `Promise<void>`
- `get_secret(key: string)`: Securely retrieves a secret (like an API key) from the OS keychain via Tauri.
  - **Args:** `key` - The identifier for the secret (e.g., 'openai_api_key').
  - **Returns:** `Promise<string | null>`
- `set_secret(key: string, value: string)`: Securely stores a secret in the OS keychain.
  - **Args:** `key`, `value`
  - **Returns:** `Promise<void>`

**Files & Knowledge Bases**
- `list_files()`: Retrieves a list of all user-uploaded files.
  - **Returns:** `Promise<ManagedFile[]>`
- `upload_file(file_path: string, file_name: string)`: Copies a file from a user-selected path into the app's managed data directory.
  - **Returns:** `Promise<ManagedFile>`
- `delete_file(file_id: string)`: Deletes a managed file.
  - **Returns:** `Promise<void>`
- `create_knowledge_base(name: string, description: string, embedding_model: string)`: Creates a new knowledge base.
  - **Returns:** `Promise<KnowledgeBase>`
- `list_knowledge_bases()`: Retrieves all knowledge bases.
  - **Returns:** `Promise<KnowledgeBase[]>`
- `add_file_to_knowledge_base(kb_id: string, file_id: string)`: Kicks off the processing pipeline to ingest a file into a knowledge base. The frontend will listen for progress events.
  - **Returns:** `Promise<void>`

**Assistants & Agents**
- `create_assistant(config: AssistantConfig)`: Creates a new assistant.
  - **Returns:** `Promise<Assistant>`
- `list_assistants()`: Retrieves all assistants.
  - **Returns:** `Promise<Assistant[]>`
- `update_assistant(assistant_id: string, config: Partial<AssistantConfig>)`: Updates an assistant.
  - **Returns:** `Promise<Assistant>`
- `delete_assistant(assistant_id: string)`: Deletes an assistant.
  - **Returns:** `Promise<void>`
- `list_agents()`: Retrieves all available agents.
  - **Returns:** `Promise<Agent[]>`

**Chat**
- `start_chat_session(assistant_id: string)`: Creates a new chat session.
  - **Returns:** `Promise<ChatSession>`
- `Messages(session_id: string, message: MessagePayload)`: Sends a message to a chat session, triggering the RAG and LLM pipeline. Responses are sent back to the frontend via events.
  - **Returns:** `Promise<void>`

---

## 3. Database Schema

### 3.1. Qdrant Vector Store

A new collection will be created for each knowledge base to ensure data isolation.

- **Collection Name:** `knowledge_base_{knowledge_base_id}` (e.g., `knowledge_base_d8a1b2c3`)
- **Vector Parameters:**
  - `size`: This will be determined by the selected embedding model (e.g., `1536` for OpenAI `text-embedding-3-small`, `4096` for Cohere `embed-english-v3.0`). This value must be stored with the knowledge base metadata.
  - `distance`: `Cosine` - Generally the best for semantic similarity with modern embedding models.
- **Payload Schema:** Each vector point will have a payload containing its metadata.

```typescript
interface ChunkPayload {
  content: string;      // The actual text chunk
  file_id: string;      // Foreign key to the file in SQLite
  file_name: string;    // Original name of the source file for display
  chunk_index: number;  // The sequential position of the chunk in the document
}
```

### 3.2. SQLite Metadata Store

This database stores all application metadata, relationships, and configurations that are not vector-based.

```sql
-- Application settings and user profile information
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Managed files copied into the app's data directory
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,          -- Relative path within the app's data dir
    size INTEGER NOT NULL,
    mime_type TEXT,
    status TEXT NOT NULL,        -- e.g., 'PENDING', 'PROCESSING', 'INDEXED', 'ERROR'
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge bases
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    embedding_model TEXT NOT NULL, -- The model used for embeddings
    vector_size INTEGER NOT NULL,  -- The dimension of vectors (e.g., 1536)
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Join table for files and knowledge bases (many-to-many)
CREATE TABLE IF NOT EXISTS knowledge_base_files (
    knowledge_base_id TEXT,
    file_id TEXT,
    PRIMARY KEY (knowledge_base_id, file_id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Assistants configuration
CREATE TABLE IF NOT EXISTS assistants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL,             -- The primary chat model
    system_prompt TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Join table for assistants and knowledge bases (many-to-many)
CREATE TABLE IF NOT EXISTS assistant_knowledge_bases (
    assistant_id TEXT,
    knowledge_base_id TEXT,
    PRIMARY KEY (assistant_id, knowledge_base_id),
    FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
);

-- Chat sessions/topics
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    assistant_id TEXT,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE SET NULL
);

-- Individual chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,              -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
```

---

## 4. Core Logic & Pseudocode

### 4.1. LLM Provider Factory (`/src-deno/lib/llm_factory.ts`)

A factory pattern will abstract the differences between LLM providers.

```typescript
// Pseudocode
import { OpenAIClient } from "./clients/openai.ts";
import { AnthropicClient } from "./clients/anthropic.ts";
// ... other clients

class LLMFactory {
  static getClient(providerId: string, apiKey: string, baseUrl?: string) {
    switch (providerId) {
      case "openai":
        return new OpenAIClient(apiKey, baseUrl);
      case "anthropic":
        return new AnthropicClient(apiKey, baseUrl);
      // ... cases for all 12 providers
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }
}

// All clients will implement a common interface
interface LLMClient {
  generateEmbeddings(texts: string[], model: string): Promise<number[][]>;
  streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk>;
}
```

### 4.2. Knowledge Base Creation Pipeline (`/src-deno/core/file_processor.ts`)

This outlines the steps taken when `add_file_to_knowledge_base` is invoked.

```typescript
// Pseudocode
async function processAndEmbedFile(fileId: string, kbId: string) {
  // 1. Get file and knowledge base info from SQLite
  const file = sqlite_client.getFile(fileId);
  const kb = sqlite_client.getKnowledgeBase(kbId);
  sqlite_client.updateFileStatus(fileId, 'PROCESSING');
  emitEventToFrontend('file-status-update', { fileId, status: 'PROCESSING' });

  // 2. Read file content
  const fileContent = await Deno.readFile(file.path);

  // 3. Parse content based on MIME type
  let text: string;
  if (file.mime_type === 'application/pdf') {
    text = await parsePdfContent(fileContent); // Use a library like pdf-parse for Deno
  } else {
    text = new TextDecoder().decode(fileContent);
  }

  // 4. Split text into manageable chunks
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await textSplitter.splitText(text);

  // 5. Generate embeddings for chunks in batches
  const llmClient = LLMFactory.getClientForModel(kb.embedding_model);
  const embeddings = await llmClient.generateEmbeddings(chunks, kb.embedding_model);

  // 6. Format data for Qdrant and upsert
  const points = chunks.map((chunk, index) => ({
    id: crypto.randomUUID(), // Qdrant point ID
    vector: embeddings[index],
    payload: { content: chunk, file_id: fileId, file_name: file.name, chunk_index: index }
  }));
  await qdrant_client.upsertPoints(`knowledge_base_${kbId}`, points);

  // 7. Finalize status
  sqlite_client.updateFileStatus(fileId, 'INDEXED');
  emitEventToFrontend('file-status-update', { fileId, status: 'INDEXED' });
}
```

### 4.3. RAG Pipeline (`/src-deno/core/rag_pipeline.ts`)

This logic is triggered by the `Messages` command.

```typescript
// Pseudocode
async function executeRagPipeline(sessionId: string, userMessage: string) {
  // 1. Retrieve session, assistant, and associated knowledge bases
  const session = sqlite_client.getSession(sessionId);
  const assistant = sqlite_client.getAssistant(session.assistant_id);
  const knowledgeBases = sqlite_client.getAssistantKnowledgeBases(assistant.id);

  let context = "";
  // 2. If knowledge bases are attached, perform vector search
  if (knowledgeBases.length > 0) {
    const embeddingModel = knowledgeBases[0].embedding_model; // Assuming same model for all KBs in an assistant
    const llmClient = LLMFactory.getClientForModel(embeddingModel);

    // 2a. Generate embedding for the user's query
    const queryEmbedding = (await llmClient.generateEmbeddings([userMessage], embeddingModel))[0];

    // 2b. Search relevant chunks in Qdrant across all associated collections
    const searchResults = await qdrant_client.searchCollections(
      knowledgeBases.map(kb => `knowledge_base_${kb.id}`),
      queryEmbedding,
      { limit: 5 } // Retrieve top 5 most relevant chunks
    );

    // 2c. Format context for the final prompt
    context = searchResults.map(result => result.payload.content).join("\n\n");
  }

  // 3. Construct the final prompt
  const chatHistory = sqlite_client.getMessagesForSession(sessionId);
  const finalPrompt = buildPromptWithContext(assistant.system_prompt, chatHistory, userMessage, context);

  // 4. Get the appropriate LLM client and stream the response
  const chatLlmClient = LLMFactory.getClientForModel(assistant.model);
  const responseStream = chatLlmClient.streamChatCompletion({ prompt: finalPrompt, model: assistant.model });

  // 5. Forward stream chunks to the frontend via Tauri events
  let fullResponse = "";
  for await (const chunk of responseStream) {
    emitEventToFrontend(`chat-stream-chunk-${sessionId}`, chunk);
    fullResponse += chunk.content;
  }

  // 6. Save messages to the database
  sqlite_client.saveMessage({ sessionId, role: 'user', content: userMessage });
  sqlite_client.saveMessage({ sessionId, role: 'assistant', content: fullResponse });
}
```

---

## 5. Configuration & Secrets Management

This strategy ensures that sensitive data is handled securely, following the principles in `Nodejs_Security_Cheat_Sheet.md`.

* **General Configuration:**
  * All non-sensitive settings (user profile, default models, UI preferences, Qdrant URL, etc.) will be stored in a `settings.json` file.
  * This file will be located in the application's data directory, which can be retrieved using the `tauri-plugin-path` API. This makes the configuration portable and easy for users to back up.
  * The `SettingsService` will be responsible for reading, writing, and validating this file.
* **Secrets Management (API Keys):**
  * **Storage:** All API keys (LLM providers, Brave Search, Qdrant) are considered secrets and **must not** be stored in `settings.json`. They will be stored in the operating system's native keychain (Windows Credential Manager, macOS Keychain).
  * **Implementation:** We will use the `tauri-plugin-stronghold` plugin. Stronghold provides a secure, database-like interface for managing secrets, backed by memory-encryption and keychain integration.
  * **Workflow:**
    1. When the user enters an API key in the frontend settings, the frontend will `invoke` a Tauri command to save it.
    2. This command will be handled by the **Rust core**, not the Deno backend. The Rust code will use the Stronghold plugin to write the secret.
    3. When the Deno backend needs an API key to make a request (e.g., in the `LLMFactory`), it will `invoke` an internal Tauri command (e.g., `get_secret`).
    4. The Rust core will handle this request, retrieve the secret from Stronghold, and return it directly to the Deno process.
* This approach ensures that the Deno process only holds secrets in memory for the duration of a request and never writes them to disk in plaintext.