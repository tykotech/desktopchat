// src/features/settings/ProviderSettings.tsx
import React, { useState, useEffect } from "react";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";
import {
  testProviderConnection,
  listProviderModels,
  getProviderConfig,
} from "../../api/settings";

interface Provider {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  type: "api" | "local";
  description?: string;
  defaultBaseUrl?: string;
  apiKeyUrl?: string;
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: "chat" | "embedding";
}

const ProviderSettings: React.FC = () => {
  const { data: settings, isLoading } = useTauriQuery("get_app_settings");
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [providerStatus, setProviderStatus] = useState<
    Record<string, Provider["status"]>
  >({});
  const [modelCache, setModelCache] = useState<Record<string, ModelInfo[]>>({});
  
  const setSecretMutation = useTauriMutation<{ key: string; value: string }, void>("set_secret");

  // Provider definitions with supported models and configurations
  const providers: Provider[] = [
    { 
      id: "openai", 
      name: "OpenAI", 
      status: "disconnected", 
      type: "api", 
      description: "GPT models", 
      apiKeyUrl: "https://platform.openai.com/api-keys"
    },
    { 
      id: "anthropic", 
      name: "Anthropic", 
      status: "disconnected", 
      type: "api", 
      description: "Claude models",
      apiKeyUrl: "https://console.anthropic.com/settings/keys"
    },
    { 
      id: "ollama", 
      name: "Ollama", 
      status: "disconnected", 
      type: "local", 
      description: "Local models",
      defaultBaseUrl: "http://localhost:11434"
    },
    { 
      id: "lmstudio", 
      name: "LM Studio", 
      status: "disconnected", 
      type: "local", 
      description: "Local models",
      defaultBaseUrl: "http://localhost:1234"
    },
    { 
      id: "openrouter", 
      name: "OpenRouter", 
      status: "disconnected", 
      type: "api", 
      description: "Unified API",
      apiKeyUrl: "https://openrouter.ai/keys"
    },
    { 
      id: "mistral", 
      name: "Mistral", 
      status: "disconnected", 
      type: "api", 
      description: "Mistral models",
      apiKeyUrl: "https://console.mistral.ai/api-keys/"
    },
    { 
      id: "groq", 
      name: "Groq", 
      status: "disconnected", 
      type: "api", 
      description: "Fast inference",
      apiKeyUrl: "https://console.groq.com/keys"
    },
    { 
      id: "together", 
      name: "Together AI", 
      status: "disconnected", 
      type: "api", 
      description: "Open source models",
      apiKeyUrl: "https://api.together.xyz/settings/api-keys"
    },
    { 
      id: "google", 
      name: "Google", 
      status: "disconnected", 
      type: "api", 
      description: "Gemini models",
      apiKeyUrl: "https://aistudio.google.com/app/apikey"
    },
    { 
      id: "azure-openai", 
      name: "Azure OpenAI", 
      status: "disconnected", 
      type: "api", 
      description: "Microsoft Azure"
    },
    { 
      id: "huggingface", 
      name: "Hugging Face", 
      status: "disconnected", 
      type: "api", 
      description: "Transformers",
      apiKeyUrl: "https://huggingface.co/settings/tokens"
    },
    { 
      id: "xai", 
      name: "xAI", 
      status: "disconnected", 
      type: "api", 
      description: "Grok models",
      apiKeyUrl: "https://console.x.ai/"
    },
    { 
      id: "deepseek", 
      name: "DeepSeek", 
      status: "disconnected", 
      type: "api", 
      description: "DeepSeek models",
      apiKeyUrl: "https://platform.deepseek.com/usage"
    },
    { 
      id: "openai-compatible", 
      name: "OpenAI Compatible", 
      status: "disconnected", 
      type: "api", 
      description: "Custom endpoints"
    },
  ];

  useEffect(() => {
    providers.forEach(async (provider) => {
      try {
        const connected = await testProviderConnection(provider.id);
        setProviderStatus((prev) => ({
          ...prev,
          [provider.id]: connected ? "connected" : "disconnected",
        }));
      } catch {
        setProviderStatus((prev) => ({ ...prev, [provider.id]: "error" }));
      }
    });
  }, []);

  useEffect(() => {
    if (editingProvider) {
      setTestResult(null);
      const cached = modelCache[editingProvider.id];
      setAvailableModels(cached || []);
      (async () => {
        try {
          const config = await getProviderConfig(editingProvider.id);
          setApiKey(config.apiKey || "");
          setBaseUrl(
            config.baseUrl || editingProvider.defaultBaseUrl || ""
          );
        } catch (error) {
          console.error("Error loading provider config:", error);
          setApiKey("");
          setBaseUrl(editingProvider.defaultBaseUrl || "");
        }
      })();
    }
  }, [editingProvider, modelCache]);

  const handleSaveProvider = async () => {
    if (editingProvider) {
      try {
        // Save API key if it's an API provider
        if (editingProvider.type === "api" && apiKey) {
          await setSecretMutation.mutateAsync({ key: `${editingProvider.id}_api_key`, value: apiKey });
        }
        
        // Save base URL if it's a local provider or custom endpoint
        if ((editingProvider.type === "local" || editingProvider.id === "openai-compatible") && baseUrl) {
          await setSecretMutation.mutateAsync({ key: `${editingProvider.id}_base_url`, value: baseUrl });
        }

        const connected = await testProviderConnection(editingProvider.id);
        setProviderStatus((prev) => ({
          ...prev,
          [editingProvider.id]: connected ? "connected" : "disconnected",
        }));

        setEditingProvider(null);
        setApiKey("");
        setBaseUrl("");
        setTestResult(null);
        setAvailableModels([]);
      } catch (error) {
        console.error("Error saving provider settings:", error);
      }
    }
  };

  const handleTestConnection = async () => {
    if (!editingProvider) return;

    setIsTesting(true);
    setTestResult(null);
    setAvailableModels([]);

    try {
      const success = await testProviderConnection(editingProvider.id);
      setTestResult(success ? "success" : "error");
      setProviderStatus((prev) => ({
        ...prev,
        [editingProvider.id]: success ? "connected" : "disconnected",
      }));

      // If successful, load available models
      if (success) {
        setIsLoadingModels(true);
        try {
          const models = await listProviderModels(editingProvider.id);
          setAvailableModels(models);
          setModelCache((prev) => ({
            ...prev,
            [editingProvider.id]: models,
          }));
        } catch (error) {
          console.error("Error fetching models:", error);
          setAvailableModels([]);
        } finally {
          setIsLoadingModels(false);
        }
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestResult("error");
      setProviderStatus((prev) => ({
        ...prev,
        [editingProvider.id]: "error",
      }));
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      <h2 className="text-xl font-bold mb-6">Model Providers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {providers.map((provider) => {
          const status = providerStatus[provider.id] || provider.status;
          return (
            <div
              key={provider.id}
              className="bg-gray-700 rounded-lg p-4 flex flex-col hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{provider.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    status === "connected"
                      ? "bg-green-500"
                      : status === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {status}
                </span>
              </div>
              {provider.description && (
                <p className="text-sm text-gray-300 mb-3">
                  {provider.description}
                </p>
              )}
              <div className="flex items-center mb-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    provider.type === "api"
                      ? "bg-blue-500"
                      : "bg-purple-500"
                  }`}
                >
                  {provider.type}
                </span>
              </div>
              <button
                onClick={() => setEditingProvider(provider)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Configure
              </button>
            </div>
          );
        })}
      </div>

      {editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Configure {editingProvider.name}</h3>
            
            {editingProvider.type === "api" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${editingProvider.name} API key`}
                />
                {editingProvider.apiKeyUrl && (
                  <p className="text-xs text-gray-400 mt-1">
                    Get your API key from <a 
                      href={editingProvider.apiKeyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {editingProvider.apiKeyUrl}
                    </a>
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Your API key is stored securely in your system's keychain.
                </p>
              </div>
            )}
            
            {(editingProvider.type === "local" || editingProvider.id === "openai-compatible") && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    editingProvider.defaultBaseUrl || "Enter base URL"
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingProvider.id === "ollama" && "Default Ollama endpoint is http://localhost:11434"}
                  {editingProvider.id === "lmstudio" && "Default LM Studio endpoint is http://localhost:1234"}
                  {editingProvider.id === "openai-compatible" && "Enter the base URL for your OpenAI-compatible endpoint"}
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white py-2 px-4 rounded transition-colors"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              
              {testResult && (
                <div className={`px-3 py-2 rounded text-sm ${
                  testResult === "success" 
                    ? "bg-green-900 text-green-200" 
                    : "bg-red-900 text-red-200"
                }`}>
                  {testResult === "success" 
                    ? "Connection successful!" 
                    : "Connection failed."}
                </div>
              )}
            </div>
            
            {testResult === "success" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Available Models
                </label>
                {isLoadingModels ? (
                  <div className="text-sm text-gray-400">Loading models...</div>
                ) : availableModels.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto bg-gray-700 rounded p-2">
                    <ul className="text-sm space-y-1">
                      {availableModels.map((model) => (
                        <li key={model.id} className="text-gray-300 flex items-center">
                          <span className="mr-2">•</span>
                          <span>{model.name || model.id}</span>
                          {model.description && (
                            <span className="text-gray-400 ml-2 text-xs">({model.description})</span>
                          )}
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            model.type === "chat" 
                              ? "bg-blue-500" 
                              : "bg-green-500"
                          }`}>
                            {model.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No models available</div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setApiKey("");
                  setBaseUrl("");
                  setTestResult(null);
                  setAvailableModels([]);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProvider}
                disabled={setSecretMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
              >
                {setSecretMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSettings;