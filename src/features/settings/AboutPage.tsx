// src/features/settings/AboutPage.tsx
import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">About DesktopChat</h2>
      
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="bg-gray-600 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mr-4">
            <span className="text-2xl">DC</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">DesktopChat</h1>
            <p className="text-gray-300">Version 1.0.0</p>
          </div>
        </div>
        
        <p className="mb-4">
          DesktopChat is a powerful desktop application that brings together multiple AI models in one convenient interface. 
          Built with privacy and user control in mind, it allows you to seamlessly switch between different AI providers 
          without compromising your data.
        </p>
        
        <p className="mb-6">
          Whether you're using cloud-based APIs or running local models, DesktopChat provides a consistent and 
          feature-rich experience for all your AI interactions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Open Source</h3>
            <p className="text-sm text-gray-300">
              Fully open source under the MIT license. View our source code on GitHub.
            </p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-gray-300">
              Your conversations stay on your device. We never store or transmit your data.
            </p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Cross-Platform</h3>
            <p className="text-sm text-gray-300">
              Available for Windows, macOS, and Linux with a consistent experience across all platforms.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="#" 
            className="flex items-center p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <div className="bg-gray-500 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-lg">GH</span>
            </div>
            <div>
              <p className="font-medium">GitHub Repository</p>
              <p className="text-xs text-gray-300">github.com/desktopchat/desktopchat</p>
            </div>
          </a>
          
          <a 
            href="#" 
            className="flex items-center p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <div className="bg-gray-500 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-lg">DC</span>
            </div>
            <div>
              <p className="font-medium">Documentation</p>
              <p className="text-xs text-gray-300">desktopchat.app/docs</p>
            </div>
          </a>
          
          <a 
            href="#" 
            className="flex items-center p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <div className="bg-gray-500 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <p className="font-medium">Community Discord</p>
              <p className="text-xs text-gray-300">Join our community</p>
            </div>
          </a>
          
          <a 
            href="#" 
            className="flex items-center p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <div className="bg-gray-500 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-lg">📧</span>
            </div>
            <div>
              <p className="font-medium">Contact Support</p>
              <p className="text-xs text-gray-300">support@desktopchat.app</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;