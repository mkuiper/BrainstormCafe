'use client';

import { AIProvider, AIModel, getModelsByProvider } from '@brainstorm-cafe/shared';
import { Brain, Zap } from 'lucide-react';

interface AIModelSelectorProps {
  selectedProvider: AIProvider;
  selectedModel: AIModel;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: AIModel) => void;
}

export default function AIModelSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: AIModelSelectorProps) {
  const providers = [
    { id: 'openai' as const, name: 'OpenAI', icon: <Brain className="h-4 w-4" /> },
    { id: 'anthropic' as const, name: 'Anthropic', icon: <Zap className="h-4 w-4" /> },
  ];

  const models = getModelsByProvider(selectedProvider);

  const handleProviderChange = (provider: AIProvider) => {
    onProviderChange(provider);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">AI Model</h3>

      {/* Provider Selection */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Provider</div>
        <div className="flex gap-2">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderChange(provider.id)}
              className={`flex-1 rounded-lg border p-2 text-sm transition-colors ${
                selectedProvider === provider.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:bg-accent'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {provider.icon}
                <span className="font-medium">{provider.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Model</div>
        <div className="space-y-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedModel === model.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-accent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{model.name}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        model.costTier === 'low'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : model.costTier === 'medium'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {model.costTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {model.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Context: {(model.contextWindow / 1000).toFixed(0)}K tokens
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
