# Frontend.md

This document provides a detailed implementation plan for the React frontend of the application. It covers the component architecture, UI/UX descriptions for each page, a state management strategy, and the integration with the Deno backend via the Tauri API bridge.

---

## 1. Component & File Structure

The frontend source code will reside in the `/src` directory and follow a feature-based organization structure. This approach groups related components, hooks, and types, making the codebase easier to navigate and maintain.

### 1.1. Directory Structure

```
/src/
├── api/              # Abstractions for invoking Tauri commands (e.g., settings.ts, chat.ts)
├── assets/           # Static assets like images, fonts, and global CSS.
├── components/       # Shared, reusable UI components (e.g., Button, Card, Modal, Spinner).
├── features/         # Components and logic organized by application feature.
│   ├── assistants/   # Components for the Assistants page (e.g., AssistantList, AssistantEditor).
│   ├── chat/         # The main chat interface components (e.g., ChatInterface, MessageBubble).
│   ├── knowledge/    # Components for managing knowledge bases.
│   └── settings/     # Components for all sections of the settings page.
├── hooks/            # Custom global React hooks (e.g., useTauriEvent, useTauriQuery).
├── lib/              # General utility functions (e.g., date formatters, class name helpers).
├── pages/            # Top-level components that correspond to application routes.
├── stores/           # Zustand global state management stores.
├── App.tsx           # Main application component with router setup.
└── main.tsx          # The entry point for the React application.
```

### 1.2. High-Level Component Architecture

The application will be built around a main layout that contains a persistent sidebar and a content area where pages are rendered by a router.

```mermaid
graph TD
    A[App.tsx] --> B[React Router];
    B --> C{MainLayout};
    C --> D[Sidebar];
    C --> E[MainContent];
    E --> F{Page Components};

    subgraph Pages
        F -- route --> G[/assistants -> AssistantsPage];
        F -- route --> H[/knowledge -> KnowledgePage];
        F -- route --> I[/settings -> SettingsLayout];
    end

    subgraph Settings Sub-Pages
        I --> J[/providers -> ProviderSettings];
        I --> K[/model -> ModelSettings];
        I --> L[...etc];
    end
```

### 1.3. Key Component Props & State

* **`ProviderSettings.tsx`** (`/features/settings/`)
  * **Purpose:** Manages the list of LLM providers.
  * **State:**
    * `const { data: settings, isLoading } = useTauriQuery(['get_app_settings']);` - Fetches settings using TanStack Query.
    * `const { mutate: updateSettings } = useTauriMutation(['update_app_settings']);` - Updates settings.
    * `const [isModalOpen, setModalOpen] = useState(false);` - Manages the visibility of the add/edit provider modal.
    * `const [selectedProvider, setSelectedProvider] = useState(null);` - Holds the provider data being edited.
  * **Props:** None.
* **`ChatInterface.tsx`** (`/features/chat/`)
  * **Purpose:** The main view for a conversation.
  * **State:**
    * `const { messages, activeSessionId } = useChatStore();` - Retrieves current chat state from Zustand.
    * `const [inputValue, setInputValue] = useState('');` - Manages the text in the message input field.
  * **Props:** `assistantId: string`.
  * **Events:** Listens for `chat-stream-chunk-{sessionId}` events to update the assistant's message in real-time.

---

## 2. UI/UX Descriptions

### 2.1. Overall Layout

* A persistent vertical **Sidebar** on the left displays icons for navigating to major sections: Assistants (Chat), Agents, Knowledge, Files, and Settings.
* The **Main Content** area on the right takes up the rest of the window and displays the currently active page.

### 2.2. Page Descriptions

* **`/assistants` (Chat Page)**
  * A three-panel layout. The leftmost panel is a list of chat sessions/topics. The middle panel is the main chat message view. An optional right panel can be opened to show assistant settings.
  * The chat view will display messages in a familiar style, with user messages aligned to the right and assistant messages to the left.
  * Markdown content, code blocks (with syntax highlighting and a "copy" button), and other rich media will be rendered directly in the chat bubbles.
  * At the bottom, a text input area will allow for multiline input and file attachments.
* **`/knowledge` (Knowledge Base Page)**
  * A two-panel layout.
  * **Left Panel:** A list of all created knowledge bases. A prominent "New Knowledge Base" button is at the top.
  * **Right Panel:** When a knowledge base is selected, this panel shows its details. At the top are the name and description. Below is a list of all files associated with it.
  * **File List:** Each file item will display its name, an icon for its type (PDF, TXT), its size, and a status indicator (`Pending`, `Indexing`, `Completed`, `Error`). A progress bar will appear during the indexing process. A "Add File" button will open the system file dialog.
* **`/settings/providers` (Model Providers Page)**
  * This page will closely replicate the UI shown in `providers.png`.
  * A grid or list of cards, each representing a configurable provider (OpenAI, Anthropic, Ollama, etc.).
  * Each card will display the provider's logo, name, and a status badge.
  * An "Edit" button on each card will open a modal for entering the API Key and any other required credentials (like Base URL).
  * This modal will include a "Test Connection" button that invokes a backend command to validate the credentials, providing immediate feedback to the user.
  * A master "Add Custom Provider" button will allow for configuring providers not in the default list.
* **`/settings/data` (Data Page)**
  * **Data Directory:** A text field showing the current path to the app's data directory, with a "Change" button that opens the system folder selection dialog.
  * **Qdrant Vector Store:** A dedicated section with form fields for the **Qdrant API Endpoint** and **Qdrant API Key**. A "Test Connection" button will validate the connection to the Qdrant instance.
  * **Database Option:** A toggle or radio button to select between the default file-based storage and a local SQLite database.

---

## 3. State Management

A combination of Zustand for global UI state and TanStack Query for server/backend state is recommended. This follows the guidelines in `React_7_Best_Practices.pdf` by separating UI state from server cache.

* **Zustand (Global UI State)**
  * **Why:** It provides a simple, unopinionated, and hook-based API that is easy to integrate and test. It removes the need for context providers and reduces boilerplate significantly compared to Redux.
  * **Stores (`/src/stores/`):**
    * **`createSettingsStore`:** Manages UI theme, language, and other non-data-related settings.
    * **`createChatStore`:** Manages the state of the active chat, including the list of messages, streaming content, and UI flags like "assistant is thinking".
    * **`createAppStore`:** Manages global application state, like sidebar visibility or the currently active navigation item.
* **TanStack Query (Server State)**
  * **Why:** It automates the complexities of data fetching, caching, and synchronization. It provides a simple hook-based API (`useQuery`, `useMutation`) that handles loading states, error states, and re-fetching data in the background, leading to a more responsive and robust UI.
  * **Usage:** It will be the primary way to interact with the Deno backend for any data that needs to be fetched or updated.

---

## 4. Tauri API Integration

Interaction with the Deno backend will be abstracted into a clean, reusable, and type-safe layer.

### 4.1. Core API Abstraction (`/src/api/`)

Wrapper functions will be created for each Tauri command to provide a clean interface and centralize the `invoke` calls.

```typescript
// /src/api/settings.ts
import { core } from '@tauri-apps/api';
import type { AppSettings } from './types'; // Shared types between frontend and backend

export const getAppSettings = (): Promise<AppSettings> => {
  return core.invoke('get_app_settings');
};

export const updateAppSettings = (settings: AppSettings): Promise<void> => {
  return core.invoke('update_app_settings', { settings });
};
```

### 4.2. Custom Hooks for Data Fetching & Events

To integrate this API layer with React components cleanly, we will use custom hooks.

**`useTauriQuery` (`/src/hooks/`):** A wrapper around TanStack Query's `useQuery` for fetching data.

```typescript
// /src/hooks/useTauriQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { core } from '@tauri-apps/api/core';

export function useTauriQuery<T>(
  command: string,
  args?: Record<string, unknown>,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: [command, args],
    queryFn: async () => await core.invoke(command, args),
    ...options,
  });
}
```

**`useTauriEvent` (`/src/hooks/`):** A hook to subscribe to backend events and manage the listener lifecycle.

```typescript
// /src/hooks/useTauriEvent.ts
import { useEffect, useCallback } from 'react';
import { event } from '@tauri-apps/api';
import type { EventCallback, UnlistenFn } from '@tauri-apps/api/event';

export function useTauriEvent<T>(eventName: string, handler: EventCallback<T>) {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    let unlisten: UnlistenFn;
    const promise = event.listen(eventName, memoizedHandler);
    promise.then(fn => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [eventName, memoizedHandler]);
}
```

### 4.3. Example: Real-time File Processing Status

This is how a component would display the status of a file being indexed.

```typescript
// /src/features/knowledge/FileStatus.tsx
import React from 'react';
import { useTauriEvent } from '@/hooks/useTauriEvent';

interface FileStatusProps {
  fileId: string;
}

export const FileStatus: React.FC<FileStatusProps> = ({ fileId }) => {
  // Assume initialStatus is fetched via useTauriQuery
  const [status, setStatus] = useState('Pending');

  useTauriEvent<{ fileId: string; status: string }>(
    'file-status-update',
    (event) => {
      if (event.payload.fileId === fileId) {
        setStatus(event.payload.status);
      }
    }
  );

  return <span>Status: {status}</span>;
};
```