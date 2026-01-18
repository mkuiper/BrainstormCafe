'use client';

import { useState } from 'react';
import ConfigPanel from '@/components/panels/ConfigPanel';
import DiscussionPanel from '@/components/panels/DiscussionPanel';
import DocumentPanel from '@/components/panels/DocumentPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { VoiceProvider } from '@brainstorm-cafe/shared';
import { GeminiVoiceName } from '@/components/voice/GeminiVoiceSelector';

export default function Home() {
  const { isConnected } = useWebSocket();
  const voiceSession = useVoiceSession();
  const [selectedProvider, setSelectedProvider] = useState<VoiceProvider>('openai-whisper');
  const [selectedGeminiVoice, setSelectedGeminiVoice] = useState<GeminiVoiceName>('Puck');

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      {/* Connection Status Bar */}
      <div className={`px-4 py-2 text-sm ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {isConnected ? '● Connected to server' : '○ Connecting to server...'}
      </div>

      <div className="flex h-[calc(100vh-40px)] w-full">
        {/* Config Panel - Left */}
        <div className="w-80 border-r border-border bg-card">
          <ConfigPanel
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            selectedGeminiVoice={selectedGeminiVoice}
            onGeminiVoiceChange={setSelectedGeminiVoice}
          />
        </div>

        {/* Discussion Panel - Center */}
        <div className="flex-1 border-r border-border">
          <DiscussionPanel
            provider={selectedProvider}
            geminiVoice={selectedGeminiVoice}
            voiceSession={voiceSession}
          />
        </div>

        {/* Document Panel - Right */}
        <div className="w-96 bg-card">
          <DocumentPanel />
        </div>
      </div>
    </main>
  );
}
