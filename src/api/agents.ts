// src/api/agents.ts
import { invoke } from '@tauri-apps/api/core';
import type { Agent } from '../../src-deno/main.ts';

export type { Agent };

export const listAgents = (): Promise<Agent[]> => {
  return invoke<Agent[]>('listAgents');
};