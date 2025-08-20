// src/__tests__/integration.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

// Create a query client for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock all the Tauri API calls
jest.mock("../hooks/useTauriQuery", () => ({
  useTauriQuery: (command: string) => {
    // Return mock data based on the command
    switch (command) {
      case "listAssistants":
        return {
          data: [
            {
              id: "1",
              name: "Test Assistant",
              description: "A test assistant",
              model: "gpt-4",
              systemPrompt: "You are a helpful assistant.",
              createdAt: "2023-01-01T00:00:00Z"
            }
          ],
          isLoading: false,
          error: null
        };
      case "getAppSettings":
        return {
          data: {
            theme: "dark",
            language: "en",
            defaultModel: "gpt-4",
            qdrantUrl: "http://localhost:6333"
          },
          isLoading: false,
          error: null
        };
      default:
        return {
          data: null,
          isLoading: false,
          error: null
        };
    }
  }
}));

jest.mock("../hooks/useTauriMutation", () => ({
  useTauriMutation: () => ({
    mutate: jest.fn(),
    isPending: false
  })
}));

describe("DesktopChat Integration", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders the main application", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Check that the main layout is rendered
    expect(screen.getByText("DesktopChat")).toBeInTheDocument();
  });

  it("navigates to assistants page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Click on the assistants link in the sidebar
    const assistantsLink = screen.getByRole('link', { name: /assistants/i });
    fireEvent.click(assistantsLink);
    
    // Wait for the assistants page to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assistants/i, level: 1 })).toBeInTheDocument();
    });
  });

  it("displays assistant list", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Navigate to assistants page
    const assistantsLink = screen.getByRole('link', { name: /assistants/i });
    fireEvent.click(assistantsLink);
    
    // Wait for assistants to load and check for test assistant
    await waitFor(() => {
      expect(screen.getByText("Test Assistant")).toBeInTheDocument();
    });
  });

  it("opens assistant settings tab", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Navigate to assistants page
    const assistantsLink = screen.getByRole('link', { name: /assistants/i });
    fireEvent.click(assistantsLink);
    
    // Wait for assistants to load
    await waitFor(() => {
      expect(screen.getByText("Test Assistant")).toBeInTheDocument();
    });
    
    // Click on the test assistant's "Chat" button to select it
    const chatButton = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(chatButton);
    
    // Click the settings button
    const settingsButton = await screen.findByText("Show Settings");
    fireEvent.click(settingsButton);
    
    // Check that the settings panel is displayed
    await waitFor(() => {
      expect(screen.getByText("Assistant Settings")).toBeInTheDocument();
    });
  });
});