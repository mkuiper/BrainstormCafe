'use client';

import { useState } from 'react';
import VoiceServiceSelector from '../voice/VoiceServiceSelector';
import { VoiceProvider } from '@brainstorm-cafe/shared';

export default function ConfigPanel() {
  const [selectedProvider, setSelectedProvider] = useState<VoiceProvider>('webspeech');

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
              onChange={setSelectedProvider}
            />
          </div>

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

// Export the selected provider for use in DiscussionPanel
export function useConfigStore() {
  const [selectedProvider, setSelectedProvider] = useState<VoiceProvider>('webspeech');
  return { selectedProvider, setSelectedProvider };
}
