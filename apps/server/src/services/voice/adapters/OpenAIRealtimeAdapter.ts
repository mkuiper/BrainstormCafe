import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';
import OpenAI from 'openai';

export class OpenAIRealtimeAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private ws: WebSocket | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
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

    // Note: OpenAI Realtime API uses WebSocket connection
    // In a real implementation, you would:
    // 1. Create ephemeral key using REST API
    // 2. Connect to wss://api.openai.com/v1/realtime
    // 3. Set up event handlers for transcription and audio

    console.log('OpenAI Realtime session started:', sessionId);
    this.session.status = 'active';

    return this.session;
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Convert audio to format expected by OpenAI Realtime API
    // Send via WebSocket connection
    console.log('Sending audio to OpenAI:', audio.byteLength, 'bytes');

    // Simulate transcription for demo purposes
    if (this.transcriptCallback) {
      setTimeout(() => {
        this.transcriptCallback?.('User speech detected...', false, 'user');
      }, 100);
    }
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Send interruption command to OpenAI Realtime API
    // This stops the current response generation
    console.log('Interrupting OpenAI session');

    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'response.cancel',
      }));
    }
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
