'use client';

import { useState } from 'react';
import { Clock, GitBranch } from 'lucide-react';

interface Version {
  version: number;
  createdAt: Date;
  trigger: 'auto' | 'manual' | 'milestone';
}

interface VersionTimelineProps {
  versions: Version[];
  currentVersion: number;
  onVersionChange: (version: number) => void;
}

export default function VersionTimeline({
  versions,
  currentVersion,
  onVersionChange,
}: VersionTimelineProps) {
  const [hoveredVersion, setHoveredVersion] = useState<number | null>(null);

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">No versions yet</span>
        </div>
      </div>
    );
  }

  const maxVersion = Math.max(...versions.map((v) => v.version));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-4 w-4" />
          <span className="text-sm font-medium">Version {currentVersion}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      {/* Timeline Slider */}
      <div className="relative px-2 py-4">
        <input
          type="range"
          min={1}
          max={maxVersion}
          value={currentVersion}
          onChange={(e) => onVersionChange(parseInt(e.target.value))}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            const version = Math.round(percent * (maxVersion - 1)) + 1;
            setHoveredVersion(version);
          }}
          onMouseLeave={() => setHoveredVersion(null)}
          className="w-full cursor-pointer accent-primary"
        />

        {/* Version Markers */}
        <div className="pointer-events-none absolute top-0 flex w-full justify-between px-2">
          {versions.map((v) => {
            const position = ((v.version - 1) / (maxVersion - 1)) * 100;
            return (
              <div
                key={v.version}
                className="absolute"
                style={{ left: `${position}%` }}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    v.version === currentVersion
                      ? 'bg-primary ring-2 ring-primary/30'
                      : v.trigger === 'manual'
                      ? 'bg-blue-500'
                      : v.trigger === 'milestone'
                      ? 'bg-purple-500'
                      : 'bg-muted'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredVersion !== null && (
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs shadow-lg">
            Version {hoveredVersion}
          </div>
        )}
      </div>

      {/* Version List */}
      <div className="max-h-40 space-y-1 overflow-y-auto text-sm">
        {versions
          .slice()
          .reverse()
          .map((v) => (
            <button
              key={v.version}
              onClick={() => onVersionChange(v.version)}
              className={`flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-accent ${
                currentVersion === v.version ? 'bg-accent' : ''
              }`}
            >
              <span className="font-medium">v{v.version}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  v.trigger === 'manual'
                    ? 'bg-blue-500/10 text-blue-500'
                    : v.trigger === 'milestone'
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {v.trigger}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
