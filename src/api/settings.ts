// src/api/settings.ts
import { AppSettings } from '../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const getAppSettings = async (): Promise<AppSettings> => {
  // In a real implementation:
  // return await invoke('get_app_settings');
  
  // For now, we'll fetch from the HTTP API
  const response = await fetch('http://localhost:8000/api/settings');
  return await response.json();
};

export const updateAppSettings = async (settings: AppSettings): Promise<void> => {
  // In a real implementation:
  // return await invoke('update_app_settings', { settings });
  
  // For now, we'll use the HTTP API
  await fetch('http://localhost:8000/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
};

export const getSecret = async (key: string): Promise<string | null> => {
  // In a real implementation:
  // return await invoke('get_secret', { key });
  
  // For now, we'll return a simulated response
  console.log(`Getting secret for key: ${key}`);
  return `simulated_${key}`;
};

export const setSecret = async (key: string, value: string): Promise<void> => {
  // In a real implementation:
  // return await invoke('set_secret', { key, value });
  
  // For now, we'll just log the action
  console.log(`Setting secret for key: ${key}`);
};

// Provider-specific functions
export const testProviderConnection = async (providerId: string): Promise<boolean> => {
  try {
    // In a real implementation:
    // return await invoke('test_provider_connection', { providerId });
    
    // For now, we'll use the HTTP API
    const response = await fetch(`http://localhost:8000/api/providers/${providerId}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error testing connection for provider ${providerId}:`, error);
    return false;
  }
};

export const listProviderModels = async (providerId: string): Promise<any[]> => {
  try {
    // In a real implementation:
    // return await invoke('list_provider_models', { providerId });
    
    // For now, we'll use the HTTP API
    const response = await fetch(`http://localhost:8000/api/providers/${providerId}/models`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const models = await response.json();
    return models;
  } catch (error) {
    console.error(`Error listing models for provider ${providerId}:`, error);
    return [];
  }
};

export const getProviderConfig = async (providerId: string): Promise<any> => {
  try {
    // In a real implementation:
    // return await invoke('get_provider_config', { providerId });
    
    // For now, we'll use the HTTP API
    const response = await fetch(`http://localhost:8000/api/providers/${providerId}/config`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const config = await response.json();
    return config;
  } catch (error) {
    console.error(`Error getting config for provider ${providerId}:`, error);
    return null;
  }
};

// Additional helper functions for specific settings
export const updateMcpServers = async (servers: any[]): Promise<void> => {
  const settings = await getAppSettings();
  settings.mcpServers = servers;
  await updateAppSettings(settings);
};