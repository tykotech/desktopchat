// src/features/settings/DataSettings.tsx
import React, { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";

const DataSettings: React.FC = () => {
  const { data: settings, isLoading } = useTauriQuery("get_app_settings");
  const updateSettingsMutation = useTauriMutation("update_app_settings");
  const testConnectionMutation = useTauriMutation("test_qdrant_connection");
  const [qdrantUrl, setQdrantUrl] = useState("http://localhost:6333");
  const [qdrantApiKey, setQdrantApiKey] = useState("");
  const [dataDirectory, setDataDirectory] = useState("/home/user/.desktopchat");
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"success" | "error" | null>(null);
  const [databaseType, setDatabaseType] = useState<"file" | "sqlite">("file");
  const [sqlitePath, setSqlitePath] = useState("/home/user/.desktopchat/app.db");

  useEffect(() => {
    if (settings) {
      setQdrantUrl(settings.qdrantUrl);
      setQdrantApiKey(settings.qdrantApiKey || "");
      setDataDirectory(settings.dataDirectory);
      if (settings.sqlitePath) {
        setSqlitePath(settings.sqlitePath);
        setDatabaseType("sqlite");
      }
    }
  }, [settings]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const result = await testConnectionMutation.mutateAsync({
        qdrantUrl,
        qdrantApiKey,
      }) as { success: boolean };
      setConnectionStatus(result.success ? "success" : "error");
      if (result.success && settings) {
        await updateSettingsMutation.mutateAsync({
          ...settings,
          qdrantUrl,
          qdrantApiKey: qdrantApiKey || undefined,
          dataDirectory,
          ...(databaseType === "sqlite" ? { sqlitePath } : {}),
        });
    } catch (error) {
      setConnectionStatus("error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleChangeDirectory = async () => {
    const selected = await open({ directory: true });
    if (typeof selected === "string") {
      setDataDirectory(selected);
      if (settings) {
        await updateSettingsMutation.mutateAsync({
          ...settings,
          dataDirectory: selected,
        });
      }
    }
  };

  const handleChangeSqlitePath = async () => {
    const selected = await open({
      filters: [{ name: "SQLite Database", extensions: ["db", "sqlite"] }],
    });
    if (typeof selected === "string") {
      setSqlitePath(selected);
      if (settings) {
        await updateSettingsMutation.mutateAsync({
          ...settings,
          sqlitePath: selected,
        });
      }
    }
  };

  const handleExportData = () => {
    // In a real implementation, this would export data
    alert("Export functionality would be implemented here");
  };

  const handleImportData = () => {
    // In a real implementation, this would import data
    alert("Import functionality would be implemented here");
  };

  const handleClearData = () => {
    // In a real implementation, this would clear data
    const confirmed = window.confirm("Are you sure you want to clear all data? This action cannot be undone.");
    if (confirmed) {
      alert("Clear data functionality would be implemented here");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Data Settings</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Database Option</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Database Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="databaseType"
                checked={databaseType === "file"}
                onChange={() => setDatabaseType("file")}
                className="mr-2"
              />
              <span>File-based Storage (Default)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="databaseType"
                checked={databaseType === "sqlite"}
                onChange={() => setDatabaseType("sqlite")}
                className="mr-2"
              />
              <span>SQLite Database</span>
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {databaseType === "file" 
              ? "Uses JSON files for storage. Simpler setup, good for most users." 
              : "Uses SQLite for storage. Better performance for large datasets."}
          </p>
        </div>
        
        {databaseType === "sqlite" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              SQLite Database Path
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={sqlitePath}
                onChange={(e) => setSqlitePath(e.target.value)}
                className="flex-1 bg-gray-600 border border-gray-500 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleChangeSqlitePath}
                className="bg-gray-600 hover:bg-gray-700 border border-l-0 border-gray-500 text-white py-2 px-4 rounded-r transition-colors"
              >
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Path to your SQLite database file. Leave empty to use default location.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Qdrant Vector Store</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Qdrant API Endpoint
          </label>
          <input
            type="text"
            value={qdrantUrl}
            onChange={(e) => setQdrantUrl(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="http://localhost:6333"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Qdrant API Key (optional)
          </label>
          <input
            type="password"
            value={qdrantApiKey}
            onChange={(e) => setQdrantApiKey(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter API key if required"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </button>
          
          {connectionStatus && (
            <div className={`px-3 py-2 rounded text-sm ${
              connectionStatus === "success" 
                ? "bg-green-900 text-green-200" 
                : "bg-red-900 text-red-200"
            }`}>
              {connectionStatus === "success" 
                ? "Connection successful!" 
                : "Connection failed. Please check your settings."}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Qdrant is used for storing and searching vector embeddings. You can use a local instance or a cloud service.
        </p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Data Directory</h3>
        <div className="flex items-center">
          <input
            type="text"
            value={dataDirectory}
            readOnly
            className="flex-1 bg-gray-600 border border-gray-500 rounded-l px-3 py-2 focus:outline-none"
          />
          <button 
            onClick={handleChangeDirectory}
            className="bg-gray-600 hover:bg-gray-700 border border-l-0 border-gray-500 text-white py-2 px-4 rounded-r transition-colors"
          >
            Change
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          This directory stores your conversations, knowledge bases, and other application data.
        </p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-medium mb-2">Export Data</h4>
            <p className="text-sm text-gray-300 mb-3">
              Export your conversations and settings to a backup file.
            </p>
            <button 
              onClick={handleExportData}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              Export
            </button>
          </div>
          
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-medium mb-2">Import Data</h4>
            <p className="text-sm text-gray-300 mb-3">
              Import conversations and settings from a backup file.
            </p>
            <button 
              onClick={handleImportData}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              Import
            </button>
          </div>
          
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-medium mb-2">Clear Data</h4>
            <p className="text-sm text-gray-300 mb-3">
              Permanently delete all conversations and reset settings.
            </p>
            <button 
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSettings;