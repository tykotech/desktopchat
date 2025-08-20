// src/pages/settings/MCPSettings.tsx
import React from 'react';
import MCPSettings from '../../features/settings/MCPSettings';

const MCPSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">MCP Settings</h1>
      <MCPSettings />
    </div>
  );
};

export default MCPSettingsPage;