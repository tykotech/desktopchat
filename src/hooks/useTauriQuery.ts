// src/hooks/useTauriQuery.ts
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export function useTauriQuery<T>(
  command: string,
  args?: Record<string, unknown>,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: [command, args],
    queryFn: async () => await invoke<T>(command, args),
    ...options,
  });
}