// src-deno/tauri_bridge.ts
// This module provides the bridge between the Deno backend and the Tauri frontend
// It uses Tauri's event system for communication

// Check if we're running in a Tauri environment
const isTauriAvailable =
  typeof window !== 'undefined' &&
  Boolean((window as { __TAURI__?: unknown }).__TAURI__);

// Emit events to the frontend
export async function emitEventToFrontend(eventName: string, payload: unknown): Promise<void> {
  try {
    if (isTauriAvailable) {
      // In a real implementation, this would use Tauri's event system:
      const { emit } = await import('@tauri-apps/api/event');
      await emit(eventName, payload);
    } else {
      // Fallback for development
      console.log(`[DEV_EVENT] ${eventName}:`, JSON.stringify(payload));
    }
  } catch (error) {
    console.error(`[TAURI_EVENT] Error emitting event ${eventName}:`, error);
  }
}

// Listen for events from the frontend or other backend modules
export async function listenToEventFromFrontend<T>(
  eventName: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  try {
    if (isTauriAvailable) {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen<T>(eventName, (event) =>
        handler(event.payload)
      );
      return unlisten;
    } else {
      console.log(`[DEV_LISTEN] ${eventName}`);
      return () => {};
    }
  } catch (error) {
    console.error(`[TAURI_EVENT] Error listening to event ${eventName}:`, error);
    return () => {};
  }
}

// Invoke commands from the frontend
export async function invokeTauriCommand(
  command: string,
  args?: Record<string, unknown>,
): Promise<unknown> {
  try {
    if (isTauriAvailable) {
      // In a real implementation, this would use Tauri's command system:
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke(command, args);
    } else {
      // Fallback for development
      console.log(`[DEV_COMMAND] ${command}:`, JSON.stringify(args));
      
      // Return simulated responses for specific commands
      switch (command) {
        case "get_secret":
          return "simulated_secret_value";
        default:
          return null;
      }
    }
  } catch (error) {
    console.error(`[TAURI_COMMAND] Error invoking command ${command}:`, error);
    throw error;
  }
}