// src/hooks/useTauriEvent.ts
import { useEffect, useCallback } from 'react';

// Hook to subscribe to Tauri events with automatic cleanup
export function useTauriEvent<T>(eventName: string, handler: (payload: T) => void) {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;

    async function setupListener() {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const fn = await listen<T>(eventName, (event) => {
          memoizedHandler(event.payload);
        });
        if (isMounted) {
          unlisten = fn;
        } else {
          fn();
        }
      } catch (error) {
        console.log(`[DEV_EVENT_LISTEN] ${eventName}`);
      }
    }

    setupListener();

    return () => {
      isMounted = false;
      if (unlisten) {
        unlisten();
      }
    };
  }, [eventName, memoizedHandler]);
}