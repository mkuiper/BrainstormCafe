import { Server, Socket } from 'socket.io';
import { ClientEvent, ServerEvent } from '@brainstorm-cafe/shared';
import {
  handleDocumentCreate,
  handleDocumentUpdate,
  handleDocumentVersionCreate,
} from './handlers/documentHandler';
import {
  handleVoiceStart,
  handleVoiceStop,
  handleVoiceInterrupt,
  handleVoiceAudio,
  cleanupVoiceSession,
} from './handlers/voiceHandler';

export function setupWebSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle client events
    socket.on('message', (event: ClientEvent) => {
      console.log('Received event:', event.type);

      // Route events to appropriate handlers
      switch (event.type) {
        case 'voice.start':
          handleVoiceStart(socket, event);
          break;
        case 'voice.stop':
          handleVoiceStop(socket);
          break;
        case 'voice.interrupt':
          handleVoiceInterrupt(socket);
          break;
        case 'voice.audio':
          handleVoiceAudio(socket, event);
          break;
        case 'agent.spawn':
          handleAgentSpawn(socket, event);
          break;
        case 'agent.inject':
          handleAgentInject(socket, event);
          break;
        case 'document.create':
          handleDocumentCreate(socket, event);
          break;
        case 'document.update':
          handleDocumentUpdate(socket, event);
          break;
        case 'document.version.create':
          handleDocumentVersionCreate(socket, event);
          break;
        default:
          console.warn('Unknown event type:', (event as any).type);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Cleanup voice session if active
      cleanupVoiceSession(socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}

// Voice handlers moved to ./handlers/voiceHandler.ts

function handleAgentSpawn(socket: Socket, event: Extract<ClientEvent, { type: 'agent.spawn' }>) {
  console.log('Agent spawn requested:', event.payload.type);
  // TODO: Implement in Phase 5/6
}

function handleAgentInject(socket: Socket, event: Extract<ClientEvent, { type: 'agent.inject' }>) {
  console.log('Agent inject requested:', event.payload.agentId);
  // TODO: Implement in Phase 6
}

// Document handlers moved to ./handlers/documentHandler.ts
