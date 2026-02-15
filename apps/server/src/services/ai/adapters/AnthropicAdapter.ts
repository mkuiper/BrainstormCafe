import Anthropic from '@anthropic-ai/sdk';
import {
  AIProviderAdapter,
  AICompletionRequest,
  AICompletionResponse,
  AIModel,
} from '@brainstorm-cafe/shared';

export class AnthropicAdapter implements AIProviderAdapter {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Separate system message from conversation
    const systemMessage = request.messages.find(m => m.role === 'system');
    const conversationMessages = request.messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

    const response = await this.client.messages.create({
      model: this.mapModelName(request.model),
      messages: conversationMessages,
      system: systemMessage?.content,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 150,
    });

    const content = response.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map(block => block.text)
      .join('');

    return {
      content,
      model: request.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  private mapModelName(model: AIModel): string {
    const modelMap: Record<string, string> = {
      'claude-opus-4-5': 'claude-opus-4-5-20251101',
      'claude-sonnet-4-5': 'claude-sonnet-4-5-20250929',
      'claude-haiku-4': 'claude-haiku-4-20250507',
    };
    return modelMap[model] || model;
  }

  getSupportedModels(): AIModel[] {
    return ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4'];
  }
}
