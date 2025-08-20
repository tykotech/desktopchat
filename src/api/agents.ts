// src/api/agents.ts
import { core } from '@tauri-apps/api';
import type { Agent } from './types';

export const listAgents = (): Promise<Agent[]> => {
  return core.invoke('listAgents');
};