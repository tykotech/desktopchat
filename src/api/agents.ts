// src/api/agents.ts
import { Agent } from '../../src-deno/main.ts';
import { executeSidecarCommand } from './sidecar';

export const listAgents = (): Promise<Agent[]> => {
  return executeSidecarCommand<Agent[]>('listAgents');
};