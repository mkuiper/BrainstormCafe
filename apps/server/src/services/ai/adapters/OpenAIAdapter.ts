import OpenAI from 'openai';
import {
  AIProviderAdapter,
  AICompletionRequest,
  AICompletionResponse,
  AIModel,
} from '@brainstorm-cafe/shared';

export class OpenAIAdapter implements AIProviderAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await this.client.chat.completions.create({
      model: this.mapModelName(request.model),
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 150,
    });

    return {
      content: response.choices[0].message.content || '',
      model: request.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  private mapModelName(model: AIModel): string {
    const modelMap: Record<string, string> = {
      'gpt-4o': 'gpt-4o',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
    };
    return modelMap[model] || model;
  }

  getSupportedModels(): AIModel[] {
    return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
}
