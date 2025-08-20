// src/api/agents.ts
import { Agent } from '../../src-deno/tauri_commands.ts';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

export const listAgents = async (): Promise<Agent[]> => {
  // In a real implementation:
  // return await invoke('list_agents');
  
  // For now, we'll fetch from the HTTP API
  const response = await fetch('http://localhost:8000/api/agents');
  return await response.json();
};