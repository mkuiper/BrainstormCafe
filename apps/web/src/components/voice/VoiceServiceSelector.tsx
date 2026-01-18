'use client';

import { VoiceProvider } from '@brainstorm-cafe/shared';
import { Headphones, Mic, Globe, AudioWaveform } from 'lucide-react';

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
    recommended?: boolean;
    badge?: string;
  }> = [
    {
      id: 'gemini',
      name: 'Google Gemini 2.5 Live',
      description: 'Ultra-low latency, native multimodal streaming',
      icon: <AudioWaveform className="h-5 w-5" />,
      features: ['Sub-600ms Latency', 'Native Barge-in', 'Gemini 2.5 Flash'],
      recommended: true,
      badge: 'NEW',
    },
    {
      id: 'openai-whisper',
      name: 'OpenAI Whisper',
      description: 'Reliable server-side transcription',
      icon: <AudioWaveform className="h-5 w-5" />,
      features: ['Reliable', 'Server Processing', 'Whisper Model'],
    },
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
      description: 'Browser-native, free (may be unreliable)',
      icon: <Globe className="h-5 w-5" />,
      features: ['Free', 'No Setup', 'Chrome/Edge Only'],
      badge: 'EXPERIMENTAL',
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
                <div className="flex items-center gap-2">
                  <span className="font-medium">{provider.name}</span>
                  {provider.badge && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      provider.badge === 'NEW'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : provider.recommended
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {provider.badge}
                    </span>
                  )}
                </div>
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
