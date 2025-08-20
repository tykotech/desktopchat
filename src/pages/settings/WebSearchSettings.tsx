// src/pages/settings/WebSearchSettings.tsx
import React from 'react';
import WebSearchSettings from '../../features/settings/WebSearchSettings';

const WebSearchSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Web Search Settings</h1>
      <WebSearchSettings />
    </div>
  );
};

export default WebSearchSettingsPage;