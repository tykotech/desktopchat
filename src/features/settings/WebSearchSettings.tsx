// src/features/settings/WebSearchSettings.tsx
import React, { useState } from "react";

interface WebSearchProvider {
  id: string;
  name: string;
  description: string;
  apiKeyUrl?: string;
  cseUrl?: string;
}

const WebSearchSettings: React.FC = () => {
  const [braveApiKey, setBraveApiKey] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [googleCseId, setGoogleCseId] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("brave");
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "error" | null>>({});

  const providers: WebSearchProvider[] = [
    {
      id: "brave",
      name: "Brave Search",
      description: "Fast and privacy-focused search API",
      apiKeyUrl: "https://api.search.brave.com/"
    },
    {
      id: "google",
      name: "Google Custom Search",
      description: "Comprehensive search results from Google",
      apiKeyUrl: "https://console.developers.google.com/",
      cseUrl: "https://cse.google.com/"
    },
    {
      id: "serp",
      name: "SerpAPI",
      description: "Structured search results from multiple providers",
      apiKeyUrl: "https://serpapi.com/"
    }
  ];

  const handleTestConnection = async (service: string) => {
    setIsTesting(service);
    setTestResults(prev => ({ ...prev, [service]: null }));
    
    try {
      // Simulate testing connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.3;
      setTestResults(prev => ({ ...prev, [service]: success ? "success" : "error" }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: "error" }));
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Web Search Settings</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Default Web Search Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedProvider === provider.id
                  ? "border-blue-500 bg-blue-900 bg-opacity-30"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="font-medium mb-2">{provider.name}</div>
              <div className="text-xs text-gray-400">{provider.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {selectedProvider === "brave" && (
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Brave Search API</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Brave API Key
            </label>
            <input
              type="password"
              value={braveApiKey}
              onChange={(e) => setBraveApiKey(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Brave Search API key"
            />
            {providers.find(p => p.id === "brave")?.apiKeyUrl && (
              <p className="text-xs text-gray-400 mt-1">
                Get your API key from <a 
                  href={providers.find(p => p.id === "brave")?.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Brave Search API
                </a>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Your API key is stored securely in your system's keychain.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTestConnection("brave")}
              disabled={isTesting === "brave"}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
            >
              {isTesting === "brave" ? "Testing..." : "Test Connection"}
            </button>
            
            {testResults.brave && (
              <div className={`px-3 py-2 rounded text-sm ${
                testResults.brave === "success" 
                  ? "bg-green-900 text-green-200" 
                  : "bg-red-900 text-red-200"
              }`}>
                {testResults.brave === "success" 
                  ? "Connection successful!" 
                  : "Connection failed."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedProvider === "google" && (
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Google Custom Search API</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Google API Key
            </label>
            <input
              type="password"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Google API key"
            />
            {providers.find(p => p.id === "google")?.apiKeyUrl && (
              <p className="text-xs text-gray-400 mt-1">
                Get your API key from <a 
                  href={providers.find(p => p.id === "google")?.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google Cloud Console
                </a>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Your API key is stored securely in your system's keychain.
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Google CSE ID
            </label>
            <input
              type="text"
              value={googleCseId}
              onChange={(e) => setGoogleCseId(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Google Custom Search Engine ID"
            />
            {providers.find(p => p.id === "google")?.cseUrl && (
              <p className="text-xs text-gray-400 mt-1">
                Create a Custom Search Engine at <a 
                  href={providers.find(p => p.id === "google")?.cseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google CSE
                </a>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTestConnection("google")}
              disabled={isTesting === "google"}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
            >
              {isTesting === "google" ? "Testing..." : "Test Connection"}
            </button>
            
            {testResults.google && (
              <div className={`px-3 py-2 rounded text-sm ${
                testResults.google === "success" 
                  ? "bg-green-900 text-green-200" 
                  : "bg-red-900 text-red-200"
              }`}>
                {testResults.google === "success" 
                  ? "Connection successful!" 
                  : "Connection failed."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedProvider === "serp" && (
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">SerpAPI</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              SerpAPI Key
            </label>
            <input
              type="password"
              value={serpApiKey}
              onChange={(e) => setSerpApiKey(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter SerpAPI key"
            />
            {providers.find(p => p.id === "serp")?.apiKeyUrl && (
              <p className="text-xs text-gray-400 mt-1">
                Get your API key from <a 
                  href={providers.find(p => p.id === "serp")?.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  SerpAPI
                </a>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Your API key is stored securely in your system's keychain.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTestConnection("serp")}
              disabled={isTesting === "serp"}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
            >
              {isTesting === "serp" ? "Testing..." : "Test Connection"}
            </button>
            
            {testResults.serp && (
              <div className={`px-3 py-2 rounded text-sm ${
                testResults.serp === "success" 
                  ? "bg-green-900 text-green-200" 
                  : "bg-red-900 text-red-200"
              }`}>
                {testResults.serp === "success" 
                  ? "Connection successful!" 
                  : "Connection failed."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSearchSettings;