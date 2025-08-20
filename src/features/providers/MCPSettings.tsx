// src/features/providers/MCPSettings.tsx
import React, { useState } from "react";

interface MCPServer {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  status: "connected" | "disconnected" | "error";
}

const MCPSettings: React.FC = () => {
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    { id: 1, name: "Local Ollama", url: "http://localhost:11434", enabled: true, status: "connected" },
  ]);

  const [newServer, setNewServer] = useState({ name: "", url: "" });
  const [isTesting, setIsTesting] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddServer = () => {
    if (newServer.name && newServer.url) {
      setMcpServers([
        ...mcpServers,
        {
          id: Date.now(),
          name: newServer.name,
          url: newServer.url,
          enabled: false,
          status: "disconnected",
        },
      ]);
      setNewServer({ name: "", url: "" });
      setShowAddForm(false);
    }
  };

  const handleToggleServer = (id: number) => {
    setMcpServers(
      mcpServers.map((server) =>
        server.id === id ? { ...server, enabled: !server.enabled } : server
      )
    );
  };

  const handleRemoveServer = (id: number) => {
    setMcpServers(mcpServers.filter((server) => server.id !== id));
  };

  const handleTestConnection = (id: number) => {
    setIsTesting(id);
    // Simulate testing connection
    setTimeout(() => {
      setMcpServers(
        mcpServers.map((server) =>
          server.id === id 
            ? { ...server, status: Math.random() > 0.5 ? "connected" : "error" } 
            : server
        )
      );
      setIsTesting(null);
    }, 1500);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">MCP Servers</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Add New MCP Server</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            {showAddForm ? "Cancel" : "Add Server"}
          </button>
        </div>
        
        {showAddForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Local Ollama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Server URL
              </label>
              <input
                type="text"
                value={newServer.url}
                onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., http://localhost:11434"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleAddServer}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                Add Server
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Configured MCP Servers</h3>
        {mcpServers.length > 0 ? (
          <div className="space-y-4">
            {mcpServers.map((server) => (
              <div
                key={server.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-600 rounded-lg"
              >
                <div className="mb-3 md:mb-0">
                  <div className="font-medium flex items-center">
                    {server.name}
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      server.status === "connected" 
                        ? "bg-green-500" 
                        : server.status === "error" 
                        ? "bg-red-500" 
                        : "bg-yellow-500"
                    }`}>
                      {server.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{server.url}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestConnection(server.id)}
                    disabled={isTesting === server.id}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
                  >
                    {isTesting === server.id ? "Testing..." : "Test"}
                  </button>
                  <button
                    onClick={() => handleToggleServer(server.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      server.enabled
                        ? "bg-green-900 text-green-200"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {server.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    onClick={() => handleRemoveServer(server.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No MCP servers configured. Add your first server above.
          </div>
        )}
      </div>
    </div>
  );
};

export default MCPSettings;