// src/features/settings/GeneralSettings.tsx
import React, { useState, useEffect } from "react";
import { useTauriQuery } from "../../hooks/useTauriQuery";
import { useTauriMutation } from "../../hooks/useTauriMutation";

const GeneralSettings: React.FC = () => {
  const { data: settings, isLoading } = useTauriQuery("get_app_settings");
  const [username, setUsername] = useState("User");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  useEffect(() => {
    if (settings) {
      setUsername(settings.username || "User");
      setLanguage(settings.language || "en");
      setTheme(settings.theme || "dark");
      setFontSize(settings.fontSize || "medium");
      setAutoSave(settings.autoSave !== undefined ? settings.autoSave : true);
      setNotifications(settings.notifications !== undefined ? settings.notifications : true);
      setAutoUpdate(settings.autoUpdate !== undefined ? settings.autoUpdate : true);
      setDataCollection(settings.dataCollection !== undefined ? settings.dataCollection : false);
    }
  }, [settings]);

  const handleSave = () => {
    // In a real implementation, this would save the settings
    alert("Settings saved successfully!");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">General Settings</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">User Profile</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
          />
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Display</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Font Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Preferences</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ru">Russian</option>
            <option value="pt">Portuguese</option>
            <option value="it">Italian</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium">
              Auto-save conversations
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Automatically save your conversations as you chat
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="sr-only"
              id="autoSaveToggle"
            />
            <label
              htmlFor="autoSaveToggle"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                autoSave ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  autoSave ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium">
              Desktop notifications
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Receive notifications for new messages
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only"
              id="notificationsToggle"
            />
            <label
              htmlFor="notificationsToggle"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                notifications ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">System</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium">
              Auto-update
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Automatically download and install updates
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="sr-only"
              id="autoUpdateToggle"
            />
            <label
              htmlFor="autoUpdateToggle"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                autoUpdate ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  autoUpdate ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium">
              Anonymous data collection
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Help improve DesktopChat by sending anonymous usage data
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none">
            <input
              type="checkbox"
              checked={dataCollection}
              onChange={(e) => setDataCollection(e.target.checked)}
              className="sr-only"
              id="dataCollectionToggle"
            />
            <label
              htmlFor="dataCollectionToggle"
              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                dataCollection ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                  dataCollection ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;