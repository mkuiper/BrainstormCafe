import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';

export class ElevenLabsAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private ws: WebSocket | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startSession(config: VoiceConfig): Promise<VoiceSession> {
    const sessionId = `elevenlabs_${Date.now()}`;

    this.session = {
      id: sessionId,
      provider: 'elevenlabs',
      config,
      status: 'connecting',
      createdAt: new Date(),
    };

    // Note: ElevenLabs Conversational AI uses WebSocket
    // In a real implementation, you would:
    // 1. Connect to wss://api.elevenlabs.io/v1/convai/conversation
    // 2. Send agent_id and configuration
    // 3. Set up event handlers for audio and transcription

    console.log('ElevenLabs Conversational AI session started:', sessionId);
    this.session.status = 'active';

    return this.session;
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Send audio chunks to ElevenLabs
    // Audio format: PCM16, 16kHz, mono
    console.log('Sending audio to ElevenLabs:', audio.byteLength, 'bytes');

    // Simulate transcription for demo purposes
    if (this.transcriptCallback) {
      setTimeout(() => {
        this.transcriptCallback?.('User speech detected (ElevenLabs)...', false, 'user');
      }, 100);
    }
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // ElevenLabs supports interruption via special message
    console.log('Interrupting ElevenLabs session');

    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'interrupt',
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

    console.log('ElevenLabs Conversational AI session ended');
  }

  getSession(): VoiceSession | null {
    return this.session;
  }
}
