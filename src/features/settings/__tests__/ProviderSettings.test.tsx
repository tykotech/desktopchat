// src/features/settings/__tests__/ProviderSettings.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import ProviderSettings from "../ProviderSettings";

// Mock the hooks
jest.mock("../../../hooks/useTauriQuery", () => ({
  useTauriQuery: () => ({
    data: {
      theme: "dark",
      language: "en",
      defaultModel: "gpt-4",
      qdrantUrl: "http://localhost:6333"
    },
    isLoading: false
  })
}));

jest.mock("../../../hooks/useTauriMutation", () => ({
  useTauriMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false
  })
}));

describe("ProviderSettings", () => {
  it("renders provider cards", () => {
    render(<ProviderSettings />);
    
    expect(screen.getByText("Model Providers")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Ollama")).toBeInTheDocument();
  });

  it("shows provider details", () => {
    render(<ProviderSettings />);
    
    const openaiCard = screen.getByText("OpenAI").closest(".bg-gray-700");
    expect(openaiCard).toBeInTheDocument();
    expect(openaiCard).toHaveTextContent("GPT models");
    expect(openaiCard).toHaveTextContent("api");
  });
});