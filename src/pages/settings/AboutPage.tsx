// src/pages/settings/AboutPage.tsx
import React from 'react';
import AboutPage from '../../features/settings/AboutPage';

const AboutPageWrapper: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">About</h1>
      <AboutPage />
    </div>
  );
};

export default AboutPageWrapper;