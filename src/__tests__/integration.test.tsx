// src/__tests__/integration.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
      case "list_assistants":
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
      case "get_app_settings":
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
    mutateAsync: jest.fn(),
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    // Check that the main layout is rendered
    expect(screen.getByText("DesktopChat")).toBeInTheDocument();
  });

  it("navigates to assistants page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    // Click on the assistants link in the sidebar
    const assistantsLink = screen.getByText("Assistants");
    fireEvent.click(assistantsLink);
    
    // Wait for the assistants page to load
    await waitFor(() => {
      expect(screen.getByText("Assistants")).toBeInTheDocument();
    });
  });

  it("displays assistant list", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    // Navigate to assistants page
    const assistantsLink = screen.getByText("Assistants");
    fireEvent.click(assistantsLink);
    
    // Wait for assistants to load and check for test assistant
    await waitFor(() => {
      expect(screen.getByText("Test Assistant")).toBeInTheDocument();
    });
  });

  it("opens assistant settings tab", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    // Navigate to assistants page
    const assistantsLink = screen.getByText("Assistants");
    fireEvent.click(assistantsLink);
    
    // Wait for assistants to load
    await waitFor(() => {
      expect(screen.getByText("Test Assistant")).toBeInTheDocument();
    });
    
    // Click on the test assistant to select it
    const assistantItem = screen.getByText("Test Assistant");
    fireEvent.click(assistantItem);
    
    // Click the settings button
    const settingsButton = screen.getByText("Show Settings");
    fireEvent.click(settingsButton);
    
    // Check that the settings panel is displayed
    await waitFor(() => {
      expect(screen.getByText("Assistant Settings")).toBeInTheDocument();
    });
  });
});