// src/pages/settings/GeneralSettings.tsx
import React from 'react';
import GeneralSettings from '../../features/settings/GeneralSettings';

const GeneralSettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">General Settings</h1>
      <GeneralSettings />
    </div>
  );
};

export default GeneralSettingsPage;