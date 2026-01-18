'use client';

import DocumentList from '../documents/DocumentList';
import DocumentEditor from '../documents/DocumentEditor';
import VersionTimeline from '../documents/VersionTimeline';
import DiffViewer from '../documents/DiffViewer';
import { useState } from 'react';

export default function DocumentPanel() {
  // Mock version data for now - will be replaced with real data from backend
  // Using static date to prevent hydration errors
  const mockVersions = [
    { version: 1, createdAt: new Date('2026-01-18T12:00:00Z'), trigger: 'manual' as const },
  ];
  const [currentVersion, setCurrentVersion] = useState(1);

  // Mock diff data
  const mockDiff = {
    versionA: 1,
    versionB: 1,
    diff: '',
    additions: 0,
    deletions: 0,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Documents</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Document List */}
          <div className="mb-4">
            <DocumentList />
          </div>

          {/* Document Editor */}
          <div className="mb-4 h-96 rounded-lg border border-border bg-background">
            <DocumentEditor />
          </div>

          {/* Version Timeline */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold">Version Timeline</h3>
            <VersionTimeline
              versions={mockVersions}
              currentVersion={currentVersion}
              onVersionChange={setCurrentVersion}
            />
          </div>

          {/* Diff Viewer */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Diff View</h3>
            <DiffViewer {...mockDiff} />
          </div>
        </div>
      </div>
    </div>
  );
}
