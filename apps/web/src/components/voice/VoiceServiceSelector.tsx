'use client';

import { VoiceProvider } from '@brainstorm-cafe/shared';
import { Headphones, Mic, Globe } from 'lucide-react';

interface VoiceServiceSelectorProps {
  selected: VoiceProvider;
  onChange: (provider: VoiceProvider) => void;
}

export default function VoiceServiceSelector({ selected, onChange }: VoiceServiceSelectorProps) {
  const providers: Array<{
    id: VoiceProvider;
    name: string;
    description: string;
    icon: React.ReactNode;
    features: string[];
  }> = [
    {
      id: 'openai',
      name: 'OpenAI Realtime API',
      description: 'Native interruption, low latency, unified LLM+voice',
      icon: <Mic className="h-5 w-5" />,
      features: ['Low Latency', 'Native Interruption', 'GPT-4 Integration'],
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs Conversational AI',
      description: 'Superior voice quality and variety',
      icon: <Headphones className="h-5 w-5" />,
      features: ['High Quality', 'Multiple Voices', 'Natural Intonation'],
    },
    {
      id: 'webspeech',
      name: 'Web Speech API',
      description: 'Browser-native, free, no API keys needed',
      icon: <Globe className="h-5 w-5" />,
      features: ['Free', 'No Setup', 'Works Offline'],
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Voice Service</h3>
      <div className="space-y-2">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onChange(provider.id)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              selected === provider.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`rounded p-2 ${selected === provider.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {provider.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{provider.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{provider.description}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
