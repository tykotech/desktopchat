# 1. Project Overview

This document outlines the high-level plan for a powerful, local-first desktop application designed for individual developers. The application will serve as a comprehensive workbench for interacting with and managing AI assistants, agents, and knowledge bases.

Built on a modern technology stack—Tauri for the application framework, Deno for the backend runtime, and Qdrant for vector storage—the application prioritizes performance, security, and a seamless developer experience. It will replicate and enhance features from the reference repository, providing a self-contained and feature-rich tool that operates primarily on the user's local machine, with Windows as the priority platform.

### Core Functionalities:
- **Assistants:** Create, manage, and chat with highly configurable AI assistants that can leverage local knowledge bases.
- **Agents:** Manage and utilize a roster of pre-defined and custom agents for various tasks.
- **Knowledge Bases:** Build and manage vector-based knowledge stores from local files (PDF, TXT, MD), enabling powerful Retrieval-Augmented Generation (RAG) capabilities.
- **File Management:** A centralized location for managing all user-uploaded files.
- **Extensive Settings:** A detailed settings panel for configuring LLM providers, default models, web search APIs, data storage (including Qdrant), and application personalization.

---

## 2. Technology Stack Justification

The technology choices are centered around modernity, performance, and security.

- **Application Framework: Tauri**
  - **Why:** Tauri allows us to build a cross-platform desktop application using web technologies for the frontend. It is significantly more lightweight and secure than alternatives like Electron because it leverages the host operating system's native web renderer. Its core is written in Rust, ensuring memory safety and high performance.

- **Backend Runtime: Deno**
  - **Why:** Deno is a modern, secure-by-default runtime for TypeScript and JavaScript. Its permission-based security model is ideal for a desktop application handling sensitive data like API keys. It offers a robust standard library, native TypeScript support without complex build configurations, and a comprehensive set of first-party tooling.

- **Vector Database: Qdrant**
  - **Why:** Qdrant is a high-performance, open-source vector database. Its API-first design makes it easy to integrate with our Deno backend. It is optimized for speed and memory efficiency, which is crucial for the RAG capabilities at the core of this application.

- **Frontend Framework: React with Vite**
  - **Why:** React is the recommended framework for this project.
    - **Mature Ecosystem:** React's vast ecosystem of libraries (state management, UI components, etc.) will accelerate development.
    - **Developer Experience:** When paired with Vite, it offers a blazing-fast development server and an optimized build process.
    - **Tauri & Deno Synergy:** Vite integrates seamlessly with both Tauri and Deno, providing a smooth and cohesive development workflow.
    - **Component-Based Architecture:** React's model is perfect for building the complex, modular UI required by this application.

### Key Deno Libraries & Modules:
- **HTTP Client:** Deno's native `fetch` API is robust and sufficient for all external API calls (Qdrant, LLM Providers, Web Search).
- **Database:** The `deno-sqlite` module will be used for the optional SQLite metadata store, providing a simple and efficient local database solution.
- **File System:** Deno's standard library (`Deno.readTextFile`, `Deno.writeFile`, etc.) will be used for all file system operations.
- **Configuration Management:** A custom service will be built to manage application settings, storing them as JSON files in the user's profile directory for simplicity and portability. Secure credentials will be handled by the operating system's keychain where possible, accessed via a Tauri plugin.

---

## 3. High-Level Architecture

The application is architected as a local-first system with a clear separation of concerns between the frontend UI, the backend logic, and external/local data services.

### Architecture Diagram

```mermaid
graph TD
    subgraph "User's Desktop"
        subgraph "Tauri Application"
            Frontend -- Tauri API Bridge --> DenoBackend;
        end

        subgraph "Frontend (WebView)"
            Frontend[React + Vite UI]
        end

        subgraph "Backend (Deno Runtime)"
            DenoBackend -- Local FS API --> FileStorage;
            DenoBackend -- SQLite Driver --> SQLiteDB;
        end

        subgraph "Local Services"
            FileStorage[(Local Filesystem)];
            SQLiteDB[(SQLite Database)];
            Ollama[Ollama (Local LLM)];
        end
    end

    subgraph "External Services (Internet)"
        Qdrant[Qdrant Cloud/Docker];
        LLM_APIs[LLM Provider APIs <br> (OpenAI, Anthropic, etc.)];
        WebSearchAPIs[Web Search APIs <br> (Google, Bing, Brave)];
    end

    DenoBackend -- HTTP API --> Qdrant;
    DenoBackend -- HTTP API --> LLM_APIs;
    DenoBackend -- HTTP API --> WebSearchAPIs;
    DenoBackend -- HTTP API --> Ollama;


    style Frontend fill:#cde4ff
    style DenoBackend fill:#d5e8d4
```

### Component Interaction Flow:
- **UI (Frontend):** The user interacts with the React-based UI. All actions (e.g., creating an assistant, uploading a file) are dispatched from UI components.
- **Tauri API Bridge:** The frontend communicates with the backend not via HTTP, but through Tauri's secure invoke mechanism. This is a performant and secure RPC-like connection.
- **Backend (Deno):** The Deno runtime listens for commands from the frontend. It contains all the core business logic:
It orchestrates calls to external LLM provider APIs.
It processes files, generates embeddings, and interacts with the Qdrant API to store and retrieve vectors.
It saves and retrieves application settings and metadata from the local filesystem (JSON files) or the optional SQLite database.

### Data & Services:
- **Local:** User files, configuration, and optional metadata are stored directly on the user's machine. The backend can also connect to a locally running Ollama instance.
- **External:** API keys provided by the user enable the Deno backend to connect to cloud services like Qdrant, OpenAI, Brave Search, etc.

---

## 4. Feature & Component Breakdown
This section maps the required features to specific backend modules and frontend components.

```csv
"Feature Area","Backend Module (/src-deno/)","Frontend Components (/src/)"
"Assistants","/assistants
services/assistant_service.ts
services/chat_service.ts
services/rag_service.ts","pages/AssistantsPage.tsx
components/AssistantList.tsx
components/AssistantCard.tsx
components/AssistantEditor.tsx
components/ChatInterface.tsx"
"Agents","/agents
services/agent_service.ts","pages/AgentsPage.tsx
components/AgentList.tsx
components/AgentCard.tsx"
"Knowledge","/knowledge
services/knowledge_service.ts
services/embedding_service.ts
lib/file_parser.ts","pages/KnowledgePage.tsx
components/KnowledgeBaseList.tsx
components/KnowledgeBaseEditor.tsx
components/FileUpload.tsx"
"Files","/files
services/file_service.ts","pages/FilesPage.tsx
components/FileList.tsx
components/FilePreview.tsx"
"Settings","/settings
services/settings_service.ts
services/secrets_service.ts","pages/SettingsLayout.tsx
pages/settings/ProvidersSettings.tsx
pages/settings/ModelSettings.tsx
pages/settings/MCPSettings.tsx
pages/settings/WebSearchSettings.tsx
pages/settings/GeneralSettings.tsx
pages/settings/DataSettings.tsx
pages/settings/AboutPage.tsx"
```

---

## 5. Development Roadmap
This roadmap is divided into logical phases, starting with the foundational elements and progressively building out the core features.

### Phase 1: Project Setup & Core Infrastructure (1 Week)
- **Initialize Project:** Set up a new Tauri project with the Deno backend and a React + Vite frontend.
Backend Scaffolding: Create the main Deno file structure, including directories for services, types, and utilities.
- **Settings Service:** Implement the core SettingsService to handle loading and saving of configuration data from/to local JSON files.
- **Secure Credentials:** Implement a SecretsService that uses the tauri-plugin-stronghold or a similar OS-level keychain solution to securely store user API keys.
- **API Client Factory:** Create a generic API client factory for making authenticated requests to external services (LLMs, Qdrant, etc.).

### Phase 2: Settings Implementation (2 Weeks)
- **UI Layout:** Build the main settings page layout with a sidebar for navigation between the different sections.
- **Model Providers:** Implement the UI and backend logic for adding, editing, and validating API keys for all specified LLM providers.
- **Data & Web Search:** Implement the Data settings page, including the Qdrant configuration. Implement the Web Search settings page, including the new Brave Search API option.
- **General & Model Settings:** Implement the remaining settings pages for general personalization (profile, language) and default model selection.
- **About Page:** Create the static "About" page.

### Phase 3: File & Knowledge Base Management (2 Weeks)
- **File Management UI:** Build the /files page to list, upload, and delete user files.
- **Backend File Service:** Implement the FileService to manage files on the local filesystem within the application's data directory.
- **Knowledge Base UI:** Build the /knowledge page to create, view, and manage knowledge bases.
- **File Processing Pipeline:** In the backend, create the pipeline for:
a. Parsing uploaded files (PDF, TXT, MD).
b. Splitting text into chunks.
c. Generating embeddings via a configured LLM provider.
d. Indexing the chunks and their metadata into a Qdrant collection.

### Phase 4: Assistants & Chat (2 Weeks)
- **Assistants UI:** Build the /assistants page to create and manage assistants. An assistant is defined by its name, prompt, model, and associated knowledge bases.
- **Chat UI:** Develop the main chat interface component.
- **RAG Pipeline:** Implement the backend RAGService. When a user sends a message, it will:
a. Generate an embedding for the user's query.
b. Query Qdrant for relevant documents from the assistant's knowledge bases.
c. Construct a final prompt including the user's query and the retrieved context.
d. Send the prompt to the configured LLM and stream the response back to the frontend.

### Phase 5: Agents, Testing & Refinement (1 Week)
- **Agents UI:** Build the /agents page to display and manage the list of agents.
- **End-to-End Testing:** Perform thorough testing of all application features, focusing on the Windows platform.
- **Bug Fixing & Polishing:** Address any identified bugs, refine the UI/UX, and improve performance.
- **Build & Release:** Prepare the application for its first release build.

---