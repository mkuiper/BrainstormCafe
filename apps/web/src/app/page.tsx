'use client';

import ConfigPanel from '@/components/panels/ConfigPanel';
import DiscussionPanel from '@/components/panels/DiscussionPanel';
import DocumentPanel from '@/components/panels/DocumentPanel';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const { isConnected } = useWebSocket();

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      {/* Connection Status Bar */}
      <div className={`px-4 py-2 text-sm ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {isConnected ? '● Connected to server' : '○ Connecting to server...'}
      </div>

      <div className="flex h-[calc(100vh-40px)] w-full">
        {/* Config Panel - Left */}
        <div className="w-80 border-r border-border bg-card">
          <ConfigPanel />
        </div>

        {/* Discussion Panel - Center */}
        <div className="flex-1 border-r border-border">
          <DiscussionPanel />
        </div>

        {/* Document Panel - Right */}
        <div className="w-96 bg-card">
          <DocumentPanel />
        </div>
      </div>
    </main>
  );
}
