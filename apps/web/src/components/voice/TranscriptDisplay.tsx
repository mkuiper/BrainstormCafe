'use client';

import { TranscriptEntry } from '@brainstorm-cafe/shared';
import { User, Bot, MessageSquare } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TranscriptDisplayProps {
  transcripts: TranscriptEntry[];
}

export default function TranscriptDisplay({ transcripts }: TranscriptDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    console.log('[TranscriptDisplay] Transcripts updated, count:', transcripts.length);
    if (transcripts.length > 0) {
      console.log('[TranscriptDisplay] Latest:', transcripts[transcripts.length - 1]);
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  if (transcripts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-20" />
          <p>Transcript will appear here</p>
          <p className="mt-1 text-sm">Start a voice session to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-3 overflow-y-auto">
      {transcripts.map((entry, index) => (
        <div
          key={entry.id || index}
          className={`flex space-x-3 ${!entry.isFinal ? 'opacity-60' : ''}`}
        >
          {/* Speaker Icon */}
          <div
            className={`flex-shrink-0 rounded-full p-2 ${
              entry.speaker === 'user'
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-purple-500/10 text-purple-500'
            }`}
          >
            {entry.speaker === 'user' ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>

          {/* Transcript Content */}
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium">
                {entry.speaker === 'user' ? 'You' : 'Agent'}
              </span>
              {!entry.isFinal && (
                <span className="text-xs text-muted-foreground">(interim)</span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground">{entry.text}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
