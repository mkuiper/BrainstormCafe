import { AIModel, AIModelInfo, AIProvider } from '../types/ai';

export const AI_MODELS: Record<AIModel, AIModelInfo> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Latest multimodal model, balanced speed and capability',
    contextWindow: 128000,
    costTier: 'medium',
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Fast and capable, optimized for performance',
    contextWindow: 128000,
    costTier: 'medium',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Cost-effective, fast responses for simpler tasks',
    contextWindow: 16385,
    costTier: 'low',
  },
  'claude-opus-4-5': {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    description: 'Most capable model, best for complex reasoning',
    contextWindow: 200000,
    costTier: 'high',
  },
  'claude-sonnet-4-5': {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Balanced intelligence and speed, recommended',
    contextWindow: 200000,
    costTier: 'medium',
  },
  'claude-haiku-4': {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    description: 'Fast and efficient, great for quick tasks',
    contextWindow: 200000,
    costTier: 'low',
  },
};

export function getModelsByProvider(provider: AIProvider): AIModelInfo[] {
  return Object.values(AI_MODELS).filter(model => model.provider === provider);
}

export function getDefaultModel(provider: AIProvider): AIModel {
  switch (provider) {
    case 'openai':
      return 'gpt-4o';
    case 'anthropic':
      return 'claude-sonnet-4-5';
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export function getModelInfo(model: AIModel): AIModelInfo {
  const info = AI_MODELS[model];
  if (!info) {
    throw new Error(`Unknown AI model: ${model}`);
  }
  return info;
}
