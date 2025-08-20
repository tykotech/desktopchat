// src/features/settings/ModelSettings.tsx
import React, { useState, useEffect } from "react";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";
import { getAppSettings, updateAppSettings, listProviderModels } from "../../api/settings";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: "chat" | "embedding";
}

const ModelSettings: React.FC = () => {
  const { data: settings, isLoading } = useTauriQuery("get_app_settings");
  const [defaultChatModel, setDefaultChatModel] = useState("gpt-4");
  const [defaultEmbeddingModel, setDefaultEmbeddingModel] = useState("text-embedding-3-small");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [availableChatModels, setAvailableChatModels] = useState<ModelInfo[]>([]);
  const [availableEmbeddingModels, setAvailableEmbeddingModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const updateSettingsMutation = useTauriMutation("update_app_settings");

  useEffect(() => {
    if (settings) {
      setDefaultChatModel(settings.defaultChatModel || "gpt-4");
      setDefaultEmbeddingModel(settings.defaultEmbeddingModel || "text-embedding-3-small");
      setTemperature(settings.temperature !== undefined ? settings.temperature : 0.7);
      setMaxTokens(settings.maxTokens !== undefined ? settings.maxTokens : 2048);
    }
  }, [settings]);

  // Load available models when settings change
  useEffect(() => {
    const loadAvailableModels = async () => {
      if (!settings) return;
      
      setIsLoadingModels(true);
      
      try {
        // Get configured providers from settings
        const configuredProviders = settings.configuredProviders || [];
        
        // Load models for each configured provider
        const chatModels: ModelInfo[] = [];
        const embeddingModels: ModelInfo[] = [];
        
        for (const providerId of configuredProviders) {
          try {
            const models = await listProviderModels(providerId);
            chatModels.push(...models.filter(m => m.type === "chat"));
            embeddingModels.push(...models.filter(m => m.type === "embedding"));
          } catch (error) {
            console.error(`Error loading models for provider ${providerId}:`, error);
          }
        }
        
        setAvailableChatModels(chatModels);
        setAvailableEmbeddingModels(embeddingModels);
      } catch (error) {
        console.error("Error loading available models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    
    loadAvailableModels();
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      const updatedSettings = {
        ...settings,
        defaultChatModel,
        defaultEmbeddingModel,
        temperature,
        maxTokens
      };
      
      await updateSettingsMutation.mutateAsync(updatedSettings);
      alert("Model settings saved successfully!");
    } catch (error) {
      console.error("Error saving model settings:", error);
      alert("Error saving model settings");
    }
  };

  const handleAddModel = () => {
    alert("Add model functionality would be implemented here");
  };

  if (isLoading || isLoadingModels) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Model Settings</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Default Models</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Default Chat Model
          </label>
          <select 
            value={defaultChatModel}
            onChange={(e) => setDefaultChatModel(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableChatModels.length > 0 ? (
              availableChatModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name || model.id} ({model.provider})
                </option>
              ))
            ) : (
              <option value="">No chat models available - configure providers first</option>
            )}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            This model will be used for general chat conversations unless specified otherwise.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Default Embedding Model
          </label>
          <select 
            value={defaultEmbeddingModel}
            onChange={(e) => setDefaultEmbeddingModel(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableEmbeddingModels.length > 0 ? (
              availableEmbeddingModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name || model.id} ({model.provider})
                </option>
              ))
            ) : (
              <option value="">No embedding models available - configure providers first</option>
            )}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            This model will be used for creating embeddings for knowledge bases.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Generation Parameters</h3>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium">
              Temperature: {temperature.toFixed(2)}
            </label>
            <span className="text-xs text-gray-400">
              {temperature < 0.3 ? "More focused" : temperature < 0.7 ? "Balanced" : "More creative"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.0 (Deterministic)</span>
            <span>1.0 (Creative)</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Controls randomness in responses. Lower values make outputs more focused and deterministic.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Tokens: {maxTokens}
          </label>
          <input
            type="range"
            min="100"
            max="8192"
            step="1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100</span>
            <span>8192</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Maximum number of tokens to generate in responses. Higher values allow for longer responses.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Model Management</h3>
          <button 
            onClick={handleAddModel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm transition-colors"
          >
            + Add Model
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableChatModels.slice(0, 5).map((model) => (
            <span key={model.id} className="bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center">
              {model.name || model.id}
              <button 
                onClick={() => setAvailableChatModels(availableChatModels.filter(m => m.id !== model.id))}
                className="ml-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          These are the models from your enabled providers. Configure more providers to access additional models.
        </p>
      </div>
      
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Save Model Settings
        </button>
      </div>
    </div>
  );
};

export default ModelSettings;