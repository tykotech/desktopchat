// src/pages/settings/ModelSettings.tsx
import React from 'react';
import ModelSettings from '../../features/settings/ModelSettings';

const ModelSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Model Settings</h1>
      <ModelSettings />
    </div>
  );
};

export default ModelSettingsPage;