// src/pages/__tests__/AssistantsPage.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AssistantsPage from "../AssistantsPage";

// Mock the hooks
jest.mock("../../hooks/useTauriQuery", () => ({
  useTauriQuery: () => ({
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
  })
}));

describe("AssistantsPage", () => {
  it("renders assistant list", () => {
    render(
      <BrowserRouter>
        <AssistantsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText("Assistants")).toBeInTheDocument();
    expect(screen.getByText("Test Assistant")).toBeInTheDocument();
  });

  it("shows settings tab when button is clicked", () => {
    render(
      <BrowserRouter>
        <AssistantsPage />
      </BrowserRouter>
    );
    
    // First select an assistant
    fireEvent.click(screen.getByText("Test Assistant"));
    
    // Then click the settings button
    fireEvent.click(screen.getByText("Show Settings"));
    
    expect(screen.getByText("Assistant Settings")).toBeInTheDocument();
  });
});