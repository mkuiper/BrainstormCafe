import { VoiceServiceAdapter, VoiceProvider } from '@brainstorm-cafe/shared';
import { OpenAIRealtimeAdapter } from './adapters/OpenAIRealtimeAdapter';
import { ElevenLabsAdapter } from './adapters/ElevenLabsAdapter';
import { WebSpeechAdapter } from './adapters/WebSpeechAdapter';

export class VoiceServiceFactory {
  private static instances = new Map<string, VoiceServiceAdapter>();

  static createAdapter(provider: VoiceProvider): VoiceServiceAdapter {
    const apiKey = this.getApiKey(provider);

    switch (provider) {
      case 'openai':
        return new OpenAIRealtimeAdapter(apiKey);

      case 'elevenlabs':
        return new ElevenLabsAdapter(apiKey);

      case 'webspeech':
        // Web Speech API doesn't need API key
        return new WebSpeechAdapter();

      default:
        throw new Error(`Unsupported voice provider: ${provider}`);
    }
  }

  static getAdapter(sessionId: string): VoiceServiceAdapter | undefined {
    return this.instances.get(sessionId);
  }

  static setAdapter(sessionId: string, adapter: VoiceServiceAdapter): void {
    this.instances.set(sessionId, adapter);
  }

  static removeAdapter(sessionId: string): void {
    this.instances.delete(sessionId);
  }

  private static getApiKey(provider: VoiceProvider): string {
    switch (provider) {
      case 'openai':
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          throw new Error('OPENAI_API_KEY not configured');
        }
        return openaiKey;

      case 'elevenlabs':
        const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
        if (!elevenlabsKey) {
          throw new Error('ELEVENLABS_API_KEY not configured');
        }
        return elevenlabsKey;

      case 'webspeech':
        return ''; // No API key needed

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  static isProviderAvailable(provider: VoiceProvider): boolean {
    try {
      if (provider === 'webspeech') {
        return true; // Always available (browser-based)
      }
      this.getApiKey(provider);
      return true;
    } catch {
      return false;
    }
  }

  static getAvailableProviders(): VoiceProvider[] {
    const providers: VoiceProvider[] = ['openai', 'elevenlabs', 'webspeech'];
    return providers.filter(p => this.isProviderAvailable(p));
  }
}
