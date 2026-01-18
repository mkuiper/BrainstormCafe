import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

export class OpenAIWhisperAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;
  private openai: OpenAI;
  private inFlight = false;
  private pendingChunks: Buffer[] = [];
  private lastFlushAt = 0;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async startSession(config: VoiceConfig): Promise<VoiceSession> {
    const sessionId = `openai_whisper_${Date.now()}`;

    this.session = {
      id: sessionId,
      provider: 'openai-whisper',
      config,
      status: 'connecting',
      createdAt: new Date(),
    };

    this.session.status = 'active';
    return this.session;
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    const buffer = Buffer.from(audio);
    if (buffer.length === 0) {
      return;
    }

    this.pendingChunks.push(buffer);

    // Clear any existing flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const now = Date.now();
    const pendingBytes = this.pendingChunks.reduce((total, chunk) => total + chunk.length, 0);

    // Flush if we have enough audio (32KB) immediately
    const shouldFlushNow = pendingBytes >= 32000;

    if (shouldFlushNow && !this.inFlight) {
      await this.flushAudio();
    } else if (!this.inFlight) {
      // Set a timer to flush after 2 seconds of no new audio
      this.flushTimer = setTimeout(() => {
        this.flushAudio().catch(console.error);
      }, 2000);
    }
  }

  private async flushAudio(): Promise<void> {
    if (this.pendingChunks.length === 0 || this.inFlight) {
      return;
    }

    this.inFlight = true;
    this.lastFlushAt = Date.now();

    // Clear the flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      const combined = Buffer.concat(this.pendingChunks);
      this.pendingChunks = [];

      const file = await toFile(combined, 'audio.webm');
      const result = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'text',
      });

      if (this.transcriptCallback && result) {
        const text = result.toString().trim();
        if (text) {
          console.log('Whisper transcription:', text);
          this.transcriptCallback(text, true, 'user');
        }
      }
    } catch (error) {
      console.error('Whisper transcription failed:', error);
    } finally {
      this.inFlight = false;
    }
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }
  }

  onTranscript(callback: (text: string, isFinal: boolean, speaker: 'user' | 'agent') => void): void {
    this.transcriptCallback = callback;
  }

  onAudioResponse(callback: (audio: ArrayBuffer) => void): void {
    this.audioCallback = callback;
  }

  async endSession(): Promise<void> {
    // Flush any remaining audio before ending
    if (this.pendingChunks.length > 0) {
      await this.flushAudio();
    }

    // Clear the flush timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.session) {
      this.session.status = 'ended';
    }

    this.transcriptCallback = null;
    this.audioCallback = null;
    this.session = null;
  }
}
