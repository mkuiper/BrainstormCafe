import { io, Socket } from 'socket.io-client';
import { ClientEvent, ServerEvent } from '@brainstorm-cafe/shared';

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(event: ServerEvent) => void>> = new Map();
  private pendingEvents: ClientEvent[] = [];

  connect(url: string): void {
    if (this.socket?.connected) {
      console.warn('WebSocket already connected');
      return;
    }

    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      if (this.pendingEvents.length > 0) {
        this.pendingEvents.forEach((event) => this.socket?.emit('message', event));
        this.pendingEvents = [];
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('message', (event: ServerEvent) => {
      this.handleServerEvent(event);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(event: ClientEvent): void {
    if (!this.socket?.connected) {
      this.pendingEvents.push(event);
      return;
    }

    this.socket.emit('message', event);
  }

  on(eventType: ServerEvent['type'], callback: (event: ServerEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return cleanup function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  private handleServerEvent(event: ServerEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsClient = new WebSocketClient();
