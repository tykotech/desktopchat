// src/pages/__tests__/AssistantsPage.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssistantsPage from "../AssistantsPage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
jest.mock("../../hooks/useTauriQuery", () => ({
  useTauriQuery: (command: string) => {
    if (command === "listAssistants") {
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
        error: null,
        refetch: jest.fn()
      };
    }
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }
}));

jest.mock("../../hooks/useTauriMutation", () => ({
  useTauriMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("AssistantsPage", () => {
  it("renders assistant list", () => {
    renderWithProviders(<AssistantsPage />);
    
    expect(screen.getByText("Assistants")).toBeInTheDocument();
    expect(screen.getByText("Test Assistant")).toBeInTheDocument();
  });

  it("shows settings tab when button is clicked", () => {
    renderWithProviders(<AssistantsPage />);
    
    // First select an assistant by clicking the "Chat" button
    fireEvent.click(screen.getByRole('button', { name: /chat/i }));
    
    // Then click the settings button
    fireEvent.click(screen.getByText("Show Settings"));
    
    expect(screen.getByText("Assistant Settings")).toBeInTheDocument();
  });
});