# DesktopChat Project Context

## Project Overview

DesktopChat is a powerful, local-first desktop application for interacting with and managing AI assistants, agents, and knowledge bases. It's built using Tauri, which allows it to have a web-based frontend with a native desktop experience.

### Key Features

- **Assistants**: Create, manage, and chat with highly configurable AI assistants that can leverage local knowledge bases.
- **Agents**: Manage and utilize a roster of pre-defined and custom agents for various tasks.
- **Knowledge Bases**: Build and manage vector-based knowledge stores from local files (PDF, TXT, MD), enabling powerful Retrieval-Augmented Generation (RAG) capabilities.
- **File Management**: A centralized location for managing all user-uploaded files.
- **Extensive Settings**: A detailed settings panel for configuring LLM providers, default models, web search APIs, data storage (including Qdrant), and application personalization.

## Technology Stack

- **Application Framework**: Tauri (Rust-based desktop application framework)
- **Backend Runtime**: Deno (TypeScript/JavaScript runtime)
- **Vector Database**: Qdrant
- **Metadata Database**: SQLite
- **Frontend Framework**: React with Vite
- **State Management**: Zustand & TanStack Query
- **Styling**: Tailwind CSS
- **Routing**: React Router

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

## Architecture

The application follows a client-server architecture where:

1. **Frontend**: A React application that runs in a Tauri webview window
2. **Backend**: A Deno HTTP server that handles all business logic and data management
3. **Communication**: The frontend communicates with the backend via HTTP requests on port 8000
4. **Data Storage**: 
   - SQLite for metadata storage
   - Qdrant for vector storage

## Development Setup

### Prerequisites

- Node.js (for frontend development)
- Deno (for backend development)
- Rust (for Tauri)

### Installation

```bash
npm install
```

### Running in Development Mode

```bash
npm run tauri dev
```

This command will:
1. Start the Vite development server on port 1420
2. Start the Deno backend server on port 8000
3. Launch the Tauri desktop application

### Building for Production

```bash
npm run tauri build
```

This will compile the application into a distributable desktop application for the target platform.

## Backend API

The Deno backend exposes a REST API on port 8000 with the following endpoints:

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

## Frontend Structure

The React frontend is organized with:
- **Pages**: Each main navigation section has its own page component
- **Components**: Reusable UI components
- **API Layer**: Abstractions for communicating with the backend
- **State Management**: Zustand for global state and TanStack Query for server state

## Key Configuration Files

- `package.json` - Frontend dependencies and scripts
- `deno.json` - Deno backend configuration and tasks
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `src-tauri/tauri.conf.json` - Tauri application configuration

## Development Workflow

1. All development commands are run through npm scripts
2. The frontend and backend can be developed independently
3. Frontend components should use the API layer to communicate with the backend
4. State management uses a combination of Zustand (for UI state) and TanStack Query (for server state)