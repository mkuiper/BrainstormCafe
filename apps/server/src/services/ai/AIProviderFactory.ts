import { AIProvider, AIProviderAdapter } from '@brainstorm-cafe/shared';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';

export class AIProviderFactory {
  private static adapters = new Map<string, AIProviderAdapter>();

  static createAdapter(provider: AIProvider): AIProviderAdapter {
    const apiKey = this.getApiKey(provider);

    switch (provider) {
      case 'openai':
        return new OpenAIAdapter(apiKey);
      case 'anthropic':
        return new AnthropicAdapter(apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  static getAdapter(sessionId: string): AIProviderAdapter | undefined {
    return this.adapters.get(sessionId);
  }

  static setAdapter(sessionId: string, adapter: AIProviderAdapter): void {
    this.adapters.set(sessionId, adapter);
  }

  static removeAdapter(sessionId: string): void {
    this.adapters.delete(sessionId);
  }

  private static getApiKey(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');
        return openaiKey;
      case 'anthropic':
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured');
        return anthropicKey;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  static isProviderAvailable(provider: AIProvider): boolean {
    try {
      this.getApiKey(provider);
      return true;
    } catch {
      return false;
    }
  }

  static getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = ['openai', 'anthropic'];
    return providers.filter(p => this.isProviderAvailable(p));
  }
}
