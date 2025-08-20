// src-deno/util/events.ts

/**
 * Emits an event to the frontend via the Tauri Rust application.
 * This works by writing a specially formatted JSON string to stdout,
 * which the Rust process is configured to listen for, interpret,
 * and forward as a Tauri event to the frontend.
 * @param eventName The name of the event.
 * @param payload The data to send with the event.
 */
export function emitEvent<T>(eventName: string, payload: T) {
  const eventPacket = {
    type: "event",
    event: eventName,
    payload,
  };
  // We use console.log to write to stdout, which is captured by the Rust host.
  // The Rust host must be configured to parse these lines and convert them into Tauri events.
  console.log(JSON.stringify(eventPacket));
}
