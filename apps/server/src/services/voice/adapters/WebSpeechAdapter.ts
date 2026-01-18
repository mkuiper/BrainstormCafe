import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';

/**
 * WebSpeechAdapter - Browser-based voice recognition and synthesis
 *
 * This adapter is unique because it runs entirely in the browser using:
 * - Web Speech API (SpeechRecognition for input)
 * - Web Speech API (SpeechSynthesis for output)
 *
 * No API keys required, completely free, works offline.
 * The server just coordinates the session state.
 */
export class WebSpeechAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;

  async startSession(config: VoiceConfig): Promise<VoiceSession> {
    const sessionId = `webspeech_${Date.now()}`;

    this.session = {
      id: sessionId,
      provider: 'webspeech',
      config,
      status: 'connecting',
      createdAt: new Date(),
    };

    // Web Speech API runs in the browser
    // The server just needs to track session state
    console.log('Web Speech API session started:', sessionId);
    this.session.status = 'active';

    return this.session;
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Web Speech API handles audio in the browser
    // This method is called for consistency but audio processing
    // happens client-side
    console.log('Audio processed in browser (Web Speech API)');
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Signal to browser to stop speech synthesis
    console.log('Interrupting Web Speech session');
  }

  onTranscript(callback: (text: string, isFinal: boolean, speaker: 'user' | 'agent') => void): void {
    this.transcriptCallback = callback;
  }

  onAudioResponse(callback: (audio: ArrayBuffer) => void): void {
    this.audioCallback = callback;
  }

  async endSession(): Promise<void> {
    if (this.session) {
      this.session.status = 'ended';
    }

    this.transcriptCallback = null;
    this.audioCallback = null;
    this.session = null;

    console.log('Web Speech API session ended');
  }

  getSession(): VoiceSession | null {
    return this.session;
  }

  // Helper method to emit transcript (called by WebSocket handler when browser sends transcript)
  emitTranscript(text: string, isFinal: boolean, speaker: 'user' | 'agent'): void {
    if (this.transcriptCallback) {
      this.transcriptCallback(text, isFinal, speaker);
    }
  }
}
