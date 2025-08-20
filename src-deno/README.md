# DesktopChat Backend

This is the Deno backend for the DesktopChat application. It provides a REST API for managing files, knowledge bases, assistants, and chat sessions.

## Features

- File management (upload, list, delete)
- Knowledge base management (create, list, add files)
- Assistant management (create, list, update, delete)
- Agent management (list predefined agents)
- Chat session management (create, send messages)
- Settings management (get, update)
- Secure secret storage (API keys)

## API Endpoints

### Settings
- `GET /api/settings` - Retrieve application settings
- `POST /api/settings` - Update application settings

### Files
- `GET /api/files` - List all files
- `POST /api/files` - Upload a file
- `DELETE /api/files/{fileId}` - Delete a file

### Knowledge Bases
- `GET /api/knowledge-bases` - List all knowledge bases
- `POST /api/knowledge-bases` - Create a new knowledge base
- `POST /api/knowledge-bases/add-file` - Add a file to a knowledge base

### Assistants
- `GET /api/assistants` - List all assistants
- `POST /api/assistants` - Create a new assistant
- `PUT /api/assistants/{assistantId}` - Update an assistant
- `DELETE /api/assistants/{assistantId}` - Delete an assistant

### Agents
- `GET /api/agents` - List all agents

### Chat
- `POST /api/chat/sessions` - Start a new chat session
- `POST /api/chat/sessions/{sessionId}` - Send a message to a chat session

## Development

### Prerequisites

- Deno 1.30+
- Qdrant vector database

### Running the Backend

```bash
deno task dev
```

This will start the backend server on http://localhost:8000

### Building the Backend

```bash
deno task build
```

This will compile the backend into a standalone executable.

## Testing

```bash
deno task test
```

## Architecture

The backend is organized into the following modules:

- `api/` - Type definitions
- `core/` - Core business logic (file processing, RAG pipeline)
- `db/` - Database clients (Qdrant, file storage)
- `lib/` - Utility libraries (LLM clients)
- `services/` - High-level services
- `util/` - Utility functions

## Security

API keys and other secrets are stored securely using the OS keychain via Tauri's Stronghold plugin.