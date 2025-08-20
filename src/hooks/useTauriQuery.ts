// src/hooks/useTauriQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

// In a real implementation, this would use Tauri's invoke function
// import { invoke } from '@tauri-apps/api/core';

// Map command names to API endpoints
const commandToEndpointMap: Record<string, string> = {
  "list_assistants": "assistants",
  "get_app_settings": "settings",
  "list_files": "files",
  "list_knowledge_bases": "knowledge-bases",
  "list_agents": "agents"
};

export function useTauriQuery<T>(
  command: string,
  args?: Record<string, unknown>,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: [command, args],
    queryFn: async () => {
      // In a real implementation:
      // return await invoke(command, args);
      
      // For now, we'll fetch from the HTTP API
      // Map command name to the correct endpoint
      const endpoint = commandToEndpointMap[command] || command;
      const response = await fetch(`http://localhost:8000/api/${endpoint}`);
      return await response.json();
    },
    ...options,
  });
}