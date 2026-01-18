import { Socket } from 'socket.io';
import { ClientEvent, ServerEvent } from '@brainstorm-cafe/shared';
import { VoiceServiceFactory } from '../../services/voice/VoiceServiceFactory';
import { transcriptService } from '../../services/voice/TranscriptService';
import { getSocketSession } from './documentHandler';

// Store active voice sessions per socket
const activeVoiceSessions = new Map<string, string>(); // socketId -> voiceSessionId

export async function handleVoiceStart(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'voice.start' }>
) {
  try {
    const { provider, config } = event.payload;
    const sessionId = await getSocketSession(socket.id);

    console.log(`Starting voice session with ${provider} for socket ${socket.id}`);

    // Create voice adapter
    const adapter = VoiceServiceFactory.createAdapter(provider);

    // Start the session
    const voiceSession = await adapter.startSession(config);

    // Store the adapter
    VoiceServiceFactory.setAdapter(voiceSession.id, adapter);
    activeVoiceSessions.set(socket.id, voiceSession.id);

    // Set up transcript callback
    adapter.onTranscript((text, isFinal, speaker) => {
      // Save to database
      transcriptService.createEntry(sessionId, speaker, text, isFinal);

      // Send to client
      const response: ServerEvent = {
        type: 'transcript.update',
        payload: { speaker, text, isFinal },
      };
      socket.emit('message', response);
    });

    // Set up audio response callback
    adapter.onAudioResponse((audio) => {
      const response: ServerEvent = {
        type: 'voice.audio',
        payload: { audio },
      };
      socket.emit('message', response);
    });

    // Send status to client
    const response: ServerEvent = {
      type: 'voice.status',
      payload: { status: 'active' },
    };
    socket.emit('message', response);

    console.log(`Voice session started: ${voiceSession.id}`);
  } catch (error) {
    console.error('Error starting voice session:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Failed to start voice session',
      },
    };
    socket.emit('message', response);
  }
}

export async function handleVoiceStop(socket: Socket) {
  try {
    const voiceSessionId = activeVoiceSessions.get(socket.id);
    if (!voiceSessionId) {
      console.warn('No active voice session to stop');
      return;
    }

    const adapter = VoiceServiceFactory.getAdapter(voiceSessionId);
    if (adapter) {
      await adapter.endSession();
      VoiceServiceFactory.removeAdapter(voiceSessionId);
    }

    activeVoiceSessions.delete(socket.id);

    // Send status to client
    const response: ServerEvent = {
      type: 'voice.status',
      payload: { status: 'ended' },
    };
    socket.emit('message', response);

    console.log(`Voice session stopped: ${voiceSessionId}`);
  } catch (error) {
    console.error('Error stopping voice session:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: { message: 'Failed to stop voice session' },
    };
    socket.emit('message', response);
  }
}

export async function handleVoiceInterrupt(socket: Socket) {
  try {
    const voiceSessionId = activeVoiceSessions.get(socket.id);
    if (!voiceSessionId) {
      console.warn('No active voice session to interrupt');
      return;
    }

    const adapter = VoiceServiceFactory.getAdapter(voiceSessionId);
    if (adapter) {
      await adapter.interrupt();
      console.log(`Voice session interrupted: ${voiceSessionId}`);
    }
  } catch (error) {
    console.error('Error interrupting voice session:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: { message: 'Failed to interrupt voice session' },
    };
    socket.emit('message', response);
  }
}

export async function handleVoiceAudio(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'voice.audio' }>
) {
  try {
    const voiceSessionId = activeVoiceSessions.get(socket.id);
    if (!voiceSessionId) {
      console.warn('No active voice session for audio');
      return;
    }

    const adapter = VoiceServiceFactory.getAdapter(voiceSessionId);
    if (adapter) {
      await adapter.sendAudio(event.payload.audio);
    }
  } catch (error) {
    console.error('Error processing voice audio:', error);
  }
}

export async function handleVoiceTranscript(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'voice.transcript' }>
) {
  try {
    const voiceSessionId = activeVoiceSessions.get(socket.id);
    if (!voiceSessionId) {
      console.warn('No active voice session for transcript');
      return;
    }

    const adapter = VoiceServiceFactory.getAdapter(voiceSessionId);
    if (adapter && 'handleUserTranscript' in adapter) {
      await (adapter as any).handleUserTranscript(voiceSessionId, event.payload.text, event.payload.isFinal);
    }
  } catch (error) {
    console.error('Error processing voice transcript:', error);
  }
}

// Cleanup on socket disconnect
export function cleanupVoiceSession(socketId: string) {
  const voiceSessionId = activeVoiceSessions.get(socketId);
  if (voiceSessionId) {
    const adapter = VoiceServiceFactory.getAdapter(voiceSessionId);
    if (adapter) {
      adapter.endSession().catch(console.error);
      VoiceServiceFactory.removeAdapter(voiceSessionId);
    }
    activeVoiceSessions.delete(socketId);
  }
}
