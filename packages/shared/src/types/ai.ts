export type AIProvider = 'openai' | 'anthropic';

export type AIModel =
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-opus-4-5'
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  model: AIModel;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIModelInfo {
  id: AIModel;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow: number;
  costTier: 'low' | 'medium' | 'high';
}

export interface AIProviderAdapter {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  stream?(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse>;
  getSupportedModels(): AIModel[];
}
