// src/pages/settings/DataSettings.tsx
import React from 'react';
import DataSettings from '../../features/settings/DataSettings';

const DataSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Settings</h1>
      <DataSettings />
    </div>
  );
};

export default DataSettingsPage;