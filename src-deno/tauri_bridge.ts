// src-deno/tauri_bridge.ts
// This module provides the bridge between the Deno backend and the Tauri frontend
// It uses Tauri's event system for communication

import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

// Check if we're running in a Tauri environment
const isTauriAvailable = typeof window !== "undefined" &&
  (window as { __TAURI__?: unknown }).__TAURI__;

// Emit events to the frontend
export async function emitEventToFrontend(
  eventName: string,
  payload: unknown,
): Promise<void> {
  try {
    if (isTauriAvailable) {
      await emit(eventName, payload);
    } else {
      console.log(`[DEV_EVENT] ${eventName}:`, JSON.stringify(payload));
    }
  } catch (error) {
    console.error(`[TAURI_EVENT] Error emitting event ${eventName}:`, error);
  }
}

// Listen for events from the frontend
export async function onFrontendEvent<T = unknown>(
  eventName: string,
  handler: (payload: T) => void | Promise<void>,
): Promise<() => void> {
  try {
    if (isTauriAvailable) {
      const unlisten = await listen(
        eventName,
        (event) => handler(event.payload as T),
      );
      return () => {
        unlisten();
      };
    } else {
      console.log(`[DEV_EVENT_LISTEN] ${eventName} (development mode)`);
      return () => {};
    }
  } catch (error) {
    console.error(
      `[TAURI_EVENT] Error listening for event ${eventName}:`,
      error,
    );
    return () => {};
  }
}

// Invoke commands from the frontend
export async function invokeTauriCommand<T = unknown>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  try {
    if (isTauriAvailable) {
      return await invoke<T>(command, args);
    } else {
      console.log(`[DEV_COMMAND] ${command}:`, JSON.stringify(args));
      switch (command) {
        case "get_secret":
          return "simulated_secret_value" as T;
        default:
          return null as T;
      }
    }
  } catch (error) {
    console.error(`[TAURI_COMMAND] Error invoking command ${command}:`, error);
    throw error;
  }
}
