import { useEffect, useState } from 'react';
import { ServerEvent } from '@brainstorm-cafe/shared';
import { wsClient } from '@/lib/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    wsClient.connect(wsUrl);

    // Monitor connection status
    const checkConnection = setInterval(() => {
      setIsConnected(wsClient.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      wsClient.disconnect();
    };
  }, []);

  return {
    isConnected,
    send: wsClient.send.bind(wsClient),
    on: wsClient.on.bind(wsClient),
  };
}

export function useWebSocketEvent<T extends ServerEvent>(
  eventType: T['type'],
  callback: (event: T) => void
) {
  useEffect(() => {
    const cleanup = wsClient.on(eventType, callback as (event: ServerEvent) => void);
    return cleanup;
  }, [eventType, callback]);
}
