// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./components/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import AssistantsPage from "./pages/AssistantsPage";
import AgentsPage from "./pages/AgentsPage";
import KnowledgePage from "./pages/KnowledgePage";
import FilesPage from "./pages/FilesPage";
import SettingsLayout from "./pages/SettingsLayout";
import GeneralSettingsPage from "./pages/settings/GeneralSettings";
import ProvidersSettings from "./pages/settings/ProvidersSettings";
import ModelSettingsPage from "./pages/settings/ModelSettings";
import MCPSettingsPage from "./pages/settings/MCPSettings";
import DataSettingsPage from "./pages/settings/DataSettings";
import WebSearchSettingsPage from "./pages/settings/WebSearchSettings";
import AboutPageWrapper from "./pages/settings/AboutPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <MainLayout>
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Routes>
                <Route path="/" element={<AssistantsPage />} />
                <Route path="/assistants" element={<AssistantsPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/settings" element={<SettingsLayout />}>
                  <Route path="general" element={<GeneralSettingsPage />} />
                  <Route path="providers" element={<ProvidersSettings />} />
                  <Route path="model" element={<ModelSettingsPage />} />
                  <Route path="mcp" element={<MCPSettingsPage />} />
                  <Route path="data" element={<DataSettingsPage />} />
                  <Route path="web-search" element={<WebSearchSettingsPage />} />
                  <Route path="about" element={<AboutPageWrapper />} />
                </Route>
              </Routes>
            </Suspense>
          </MainLayout>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;