import { VoiceServiceAdapter, VoiceConfig, VoiceSession } from '@brainstorm-cafe/shared';
import WebSocket from 'ws';

/**
 * GeminiLiveAdapter - Google Gemini 2.5 Live API
 *
 * Uses the Multimodal Live API with WebSocket for bidirectional streaming
 * Provides sub-600ms latency with native interruption support
 */
export class GeminiLiveAdapter implements VoiceServiceAdapter {
  private session: VoiceSession | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean, speaker: 'user' | 'agent') => void) | null = null;
  private audioCallback: ((audio: ArrayBuffer) => void) | null = null;
  private ws: WebSocket | null = null;
  private apiKey: string;
  private modelName = 'gemini-2.5-flash-native-audio-preview-12-2025';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startSession(config: VoiceConfig): Promise<VoiceSession> {
    const sessionId = `gemini_${Date.now()}`;

    this.session = {
      id: sessionId,
      provider: 'gemini',
      config,
      status: 'connecting',
      createdAt: new Date(),
    };

    try {
      // Connect to Gemini Live API via WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

      console.log('[Gemini] Connecting to WebSocket...');
      this.ws = new WebSocket(wsUrl);

      await new Promise((resolve, reject) => {
        if (!this.ws) {
          console.error('[Gemini] WebSocket not initialized');
          reject(new Error('WebSocket not initialized'));
          return;
        }

        const timeout = setTimeout(() => {
          console.error('[Gemini] WebSocket connection timeout (10s)');
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.ws.on('open', () => {
          clearTimeout(timeout);
          console.log('[Gemini] WebSocket connected successfully');

          // Send setup configuration
          const voiceName = config.settings?.voiceId || 'Puck';
          const setupMessage = {
            setup: {
              model: `models/${this.modelName}`,
              generation_config: {
                response_modalities: ['AUDIO'],
                speech_config: {
                  voice_config: {
                    prebuilt_voice_config: {
                      voice_name: voiceName, // Natural, conversational voice
                    },
                  },
                },
              },
              input_audio_transcription: {},
              output_audio_transcription: {},
              system_instruction: {
                parts: [{
                  text: 'You are a helpful AI assistant in a brainstorming session called BrainStorm Cafe. Be concise, creative, and conversational. Keep your responses brief and natural since they will be spoken aloud.',
                }],
              },
            },
          };

          console.log('[Gemini] Sending setup message:', JSON.stringify(setupMessage, null, 2));
          this.ws?.send(JSON.stringify(setupMessage));
          resolve(undefined);
        });

        this.ws.on('error', (error) => {
          clearTimeout(timeout);
          console.error('[Gemini] WebSocket error:', error);
          console.error('[Gemini] Error details:', JSON.stringify(error, null, 2));
          reject(error);
        });

        this.ws.on('close', (code, reason) => {
          console.log('[Gemini] WebSocket closed. Code:', code, 'Reason:', reason.toString());
        });

        this.ws.on('message', (data) => {
          console.log('[Gemini] Received message:', data.toString().substring(0, 200));
          this.handleMessage(data.toString());
        });
      });

      this.session.status = 'active';
      console.log(`Gemini Live session started: ${sessionId}`);
      return this.session;
    } catch (error) {
      console.error('Error starting Gemini session:', error);
      this.session.status = 'error';
      throw error;
    }
  }

  async sendAudio(audio: ArrayBuffer): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Gemini] WebSocket not ready, skipping audio');
      return;
    }

    try {
      // Convert ArrayBuffer to base64
      const buffer = Buffer.from(audio);
      const base64Audio = buffer.toString('base64');

      // Gemini Live API expects raw PCM for best results
      const message = {
        realtime_input: {
          media_chunks: [{
            mime_type: 'audio/pcm;rate=16000',
            data: base64Audio,
          }],
        },
      };

      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[Gemini] Error sending audio:', error);
    }
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.session.status !== 'active') {
      throw new Error('Session not active');
    }

    // Gemini supports native interruption - just send an empty turn
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        client_content: {
          turn_complete: true,
        },
      };
      this.ws.send(JSON.stringify(message));
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

    console.log('Gemini Live session ended');
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle setup complete
      if (message.setupComplete) {
        console.log('[Gemini] Setup complete');
        return;
      }

      // Handle server content (responses)
      if (message.serverContent) {
        const content = message.serverContent;

        // Handle text transcripts
        if (content.outputTranscription?.text && this.transcriptCallback) {
          const isFinal = content.turnComplete || false;
          this.transcriptCallback(content.outputTranscription.text, isFinal, 'agent');
        }

        if (content.inputTranscription?.text && this.transcriptCallback) {
          const isFinal = content.turnComplete || false;
          this.transcriptCallback(content.inputTranscription.text, isFinal, 'user');
        }

        // Handle model turn parts (audio + optional text)
        if (content.modelTurn?.parts) {
          for (const part of content.modelTurn.parts) {
            if (part.text && this.transcriptCallback) {
              const isFinal = content.turnComplete || false;
              this.transcriptCallback(part.text, isFinal, 'agent');
            }

            if (part.inlineData?.data && this.audioCallback) {
              const audioData = Buffer.from(part.inlineData.data, 'base64');
              const audioSlice = audioData.buffer.slice(
                audioData.byteOffset,
                audioData.byteOffset + audioData.byteLength
              );
              this.audioCallback(audioSlice);
            }
          }
        }
      }

      // Handle tool calls (if we implement them later)
      if (message.toolCall) {
        console.log('[Gemini] Tool call received:', message.toolCall);
      }

      // Handle errors
      if (message.error) {
        console.error('[Gemini] Server error:', message.error);
      }
    } catch (error) {
      console.error('[Gemini] Error parsing message:', error);
    }
  }

  getSession(): VoiceSession | null {
    return this.session;
  }
}
