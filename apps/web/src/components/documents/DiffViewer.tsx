'use client';

import { FileCode, Plus, Minus } from 'lucide-react';

interface DiffViewerProps {
  versionA: number;
  versionB: number;
  diff: string;
  additions: number;
  deletions: number;
}

export default function DiffViewer({
  versionA,
  versionB,
  diff,
  additions,
  deletions,
}: DiffViewerProps) {
  if (!diff) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <FileCode className="h-4 w-4" />
          <span className="text-sm">Select two versions to compare</span>
        </div>
      </div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCode className="h-4 w-4" />
          <span className="text-sm font-medium">
            v{versionA} → v{versionB}
          </span>
        </div>
        <div className="flex space-x-3 text-xs">
          <span className="flex items-center space-x-1 text-green-500">
            <Plus className="h-3 w-3" />
            <span>{additions}</span>
          </span>
          <span className="flex items-center space-x-1 text-red-500">
            <Minus className="h-3 w-3" />
            <span>{deletions}</span>
          </span>
        </div>
      </div>

      {/* Diff Display */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-border bg-background">
        <div className="font-mono text-xs">
          {lines.map((line, index) => {
            const isAddition = line.startsWith('+ ');
            const isDeletion = line.startsWith('- ');
            const isUnchanged = line.startsWith('  ');

            return (
              <div
                key={index}
                className={`px-3 py-0.5 ${
                  isAddition
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : isDeletion
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : isUnchanged
                    ? 'text-muted-foreground'
                    : ''
                }`}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
