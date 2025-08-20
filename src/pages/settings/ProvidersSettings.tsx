// src/pages/settings/ProvidersSettings.tsx
import React from 'react';
import ProviderSettings from '../../features/settings/ProviderSettings';

const ProvidersSettings: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Model Providers</h1>
      <ProviderSettings />
    </div>
  );
};

export default ProvidersSettings;