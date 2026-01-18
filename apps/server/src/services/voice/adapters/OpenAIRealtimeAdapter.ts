import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';
import OpenAI from 'openai';
import WebSocket from 'ws';

export class OpenAIRealtimeAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private ws: WebSocket | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;
  private openai: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.apiKey = apiKey;
  }

  async startSession(config: VoiceConfig): Promise<VoiceSession> {
    const sessionId = `openai_${Date.now()}`;

    this.session = {
      id: sessionId,
      provider: 'openai',
      config,
      status: 'connecting',
      createdAt: new Date(),
    };

    try {
      // Connect to OpenAI Realtime API
      // Note: OpenAI Realtime API is in beta, this is the connection pattern
      const wsUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      this.ws.on('open', () => {
        console.log('OpenAI Realtime WebSocket connected');
        if (this.session) {
          this.session.status = 'active';
        }

        // Send session configuration
        this.ws?.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful AI assistant in a brainstorming session. Be concise and creative.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
            },
          },
        }));
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const event = JSON.parse(data.toString());
          this.handleRealtimeEvent(event);
        } catch (error) {
          console.error('Error parsing OpenAI event:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('OpenAI WebSocket error:', error);
        if (this.session) {
          this.session.status = 'error';
        }
      });

      this.ws.on('close', () => {
        console.log('OpenAI WebSocket closed');
        if (this.session) {
          this.session.status = 'ended';
        }
      });

      this.session.status = 'active';
    } catch (error) {
      console.error('Failed to start OpenAI Realtime session:', error);
      this.session.status = 'error';
    }

    return this.session;
  }

  private handleRealtimeEvent(event: any) {
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        // User speech transcription
        if (this.transcriptCallback && event.transcript) {
          this.transcriptCallback(event.transcript, true, 'user');
        }
        break;

      case 'response.audio_transcript.delta':
        // Agent speech transcription (streaming)
        if (this.transcriptCallback && event.delta) {
          this.transcriptCallback(event.delta, false, 'agent');
        }
        break;

      case 'response.audio_transcript.done':
        // Agent speech transcription (complete)
        if (this.transcriptCallback && event.transcript) {
          this.transcriptCallback(event.transcript, true, 'agent');
        }
        break;

      case 'response.audio.delta':
        // Agent audio response
        if (this.audioCallback && event.delta) {
          // Convert base64 audio to ArrayBuffer
          const audioBuffer = Buffer.from(event.delta, 'base64');
          this.audioCallback(audioBuffer.buffer);
        }
        break;

      case 'error':
        console.error('OpenAI Realtime error:', event.error);
        break;

      default:
        // Log other events for debugging
        console.log('OpenAI event:', event.type);
    }
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready, skipping audio chunk');
      return;
    }

    // Convert ArrayBuffer to base64
    const buffer = Buffer.from(audio);
    const base64Audio = buffer.toString('base64');

    // Send audio to OpenAI Realtime API
    this.ws.send(JSON.stringify({
      type: 'input_audio_buffer.append',
      audio: base64Audio,
    }));
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    // Send interruption command to OpenAI Realtime API
    this.ws.send(JSON.stringify({
      type: 'response.cancel',
    }));

    // Also commit any pending audio and create a new response
    this.ws.send(JSON.stringify({
      type: 'input_audio_buffer.commit',
    }));

    console.log('Interrupted OpenAI session');
  }

  onTranscript(callback: (text: string, isFinal: boolean, speaker: 'user' | 'agent') => void): void {
    this.transcriptCallback = callback;
  }

  onAudioResponse(callback: (audio: ArrayBuffer) => void): void {
    this.audioCallback = callback;
  }

  async endSession(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.session) {
      this.session.status = 'ended';
    }

    this.transcriptCallback = null;
    this.audioCallback = null;
    this.session = null;

    console.log('OpenAI Realtime session ended');
  }

  getSession(): VoiceSession | null {
    return this.session;
  }
}
