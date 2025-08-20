# DesktopChat Backend

This directory contains the Deno backend for the DesktopChat application. The backend runs as a command-driven process that communicates with the Tauri frontend over standard input/output rather than exposing an HTTP API.

## Features

- File management (upload, list, delete)
- Knowledge base management (create, list, add files)
- Assistant management (create, list, update, delete)
- Agent management (list predefined agents)
- Chat session management (create, send messages)
- Settings management (get, update)
- Secure secret storage (API keys)

## Tauri Command Workflow

The backend exposes a set of Tauri commands that the frontend invokes for operations such as managing files, knowledge bases, assistants and chat sessions. These commands are defined in `main.ts` and re-exported for Tauri in `tauri_commands.ts`.

## Development

### Prerequisites

- Deno 1.30+
- Qdrant vector database

### Running the Backend

```bash
deno task dev
```

This starts the backend in command mode for standalone development. The Tauri application automatically spawns this process during normal development with `npm run tauri dev`.

### Building the Backend

```bash
deno task build
```

This compiles the backend into a standalone executable.

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