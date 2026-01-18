'use client';

import VoiceServiceSelector from '../voice/VoiceServiceSelector';
import GeminiVoiceSelector, { GeminiVoiceName } from '../voice/GeminiVoiceSelector';
import { VoiceProvider } from '@brainstorm-cafe/shared';

interface ConfigPanelProps {
  selectedProvider: VoiceProvider;
  onProviderChange: (provider: VoiceProvider) => void;
  selectedGeminiVoice: GeminiVoiceName;
  onGeminiVoiceChange: (voice: GeminiVoiceName) => void;
}

export default function ConfigPanel({
  selectedProvider,
  onProviderChange,
  selectedGeminiVoice,
  onGeminiVoiceChange,
}: ConfigPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Voice Provider Section */}
          <div>
            <VoiceServiceSelector
              selected={selectedProvider}
              onChange={onProviderChange}
            />
          </div>
          {selectedProvider === 'gemini' && (
            <GeminiVoiceSelector selected={selectedGeminiVoice} onChange={onGeminiVoiceChange} />
          )}

          {/* AI Model Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium">AI Model</h3>
            <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
              AI model selection will be available in Phase 4
            </div>
          </div>

          {/* Templates Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Templates</h3>
            <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
              Document templates available in Create Document dialog
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
