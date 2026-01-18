'use client';

import { useState } from 'react';
import VoiceControl from '../voice/VoiceControl';
import TranscriptDisplay from '../voice/TranscriptDisplay';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { VoiceProvider } from '@brainstorm-cafe/shared';

export default function DiscussionPanel() {
  // For now, default to Web Speech API (free, no setup)
  const [selectedProvider] = useState<VoiceProvider>('webspeech');
  const { transcripts } = useVoiceSession();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Discussion</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Transcript Display */}
        <div className="mb-4 h-96 overflow-y-auto rounded-lg border border-border bg-card p-4">
          <TranscriptDisplay transcripts={transcripts} />
        </div>

        {/* Voice Controls */}
        <div className="mb-4">
          <VoiceControl provider={selectedProvider} />
        </div>

        {/* Research Agents */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Research Agents</h3>
          <p className="text-sm text-muted-foreground">
            No active research agents · Phase 6 feature
          </p>
        </div>
      </div>
    </div>
  );
}
