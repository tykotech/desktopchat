# DesktopChat

A powerful, local-first desktop application for interacting with and managing AI assistants, agents, and knowledge bases.

## Features

- **Assistants**: Create, manage, and chat with highly configurable AI assistants that can leverage local knowledge bases.
- **Agents**: Manage and utilize a roster of pre-defined and custom agents for various tasks.
- **Knowledge Bases**: Build and manage vector-based knowledge stores from local files (PDF, TXT, MD), enabling powerful Retrieval-Augmented Generation (RAG) capabilities.
- **File Management**: A centralized location for managing all user-uploaded files.
- **Extensive Settings**: A detailed settings panel for configuring LLM providers, default models, web search APIs, data storage (including Qdrant), and application personalization.

## Implemented Components

### Frontend (React + TypeScript)
- **Main Layout**: Sidebar navigation with access to all sections
- **Assistants Page**: Create and manage AI assistants with chat interface
- **Agents Page**: Browse and use specialized agents
- **Knowledge Page**: Create and manage knowledge bases
- **Files Page**: Upload and manage local files
- **Settings Pages**:
  - General settings (user profile, language, theme)
  - Provider settings (API keys for LLM providers)
  - Model settings (default models)
  - MCP Servers (Model Configuration Protocol servers)
  - Data settings (Qdrant configuration)
  - Web Search settings (Brave, Google APIs)
  - About page (application information)

### Backend (Deno + TypeScript)
- **Services**:
  - Assistant service (create, list, update, delete assistants)
  - Agent service (list available agents)
  - Chat service (start chat sessions, send messages)
  - File service (upload, list, delete files)
  - Knowledge service (create knowledge bases, add files to knowledge bases)
  - Settings service (manage application settings)
- **Core Modules**:
  - File processor (parse, chunk, and embed files)
  - RAG pipeline (retrieve relevant context and generate responses)
  - LLM factory (abstract different LLM providers)
- **Database**:
  - SQLite client (metadata storage)
  - Qdrant client (vector storage)

## Technology Stack

- **Application Framework**: Tauri
- **Backend Runtime**: Deno
- **Vector Database**: Qdrant
- **Metadata Database**: SQLite
- **Frontend Framework**: React with Vite
- **State Management**: Zustand & TanStack Query
- **Styling**: Tailwind CSS

## Project Structure

```
├── src/                    # React Frontend Source
│   ├── api/               # Tauri command abstractions
│   ├── components/        # Shared UI components
│   ├── features/          # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Top-level page components
│   ├── stores/            # Zustand global state
│   └── assets/            # Static assets
├── src-deno/              # Deno Backend Source
│   ├── api/               # Type definitions
│   ├── core/              # Core business logic
│   ├── db/                # Database clients
│   ├── lib/               # Utility libraries
│   ├── services/          # High-level services
│   ├── util/              # Utility functions
│   └── main.ts            # Main entry point
├── src-tauri/             # Tauri Rust Core
└── Design/                # Design documents and reference images
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run tauri dev
   ```

## Building

To build the application:
```bash
npm run tauri build
```