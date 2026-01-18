'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDocument } from '@/hooks/useDocument';
import { useDocumentStore } from '@/store/documentStore';
import { Save, FileText } from 'lucide-react';

export default function DocumentEditor() {
  const { saveDocument, createSnapshot } = useDocument();
  const { getActiveDocument } = useDocumentStore();
  const activeDocument = getActiveDocument();

  const [content, setContent] = useState(activeDocument?.content || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (activeDocument) {
      setContent(activeDocument.content);
      setHasUnsavedChanges(false);
    }
  }, [activeDocument?.id]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    if (activeDocument && hasUnsavedChanges) {
      saveDocument(activeDocument.id, content);
      setHasUnsavedChanges(false);
    }
  }, [activeDocument, content, hasUnsavedChanges, saveDocument]);

  const handleSnapshot = useCallback(() => {
    if (activeDocument) {
      // Save first if there are unsaved changes
      if (hasUnsavedChanges) {
        saveDocument(activeDocument.id, content);
        setHasUnsavedChanges(false);
      }
      createSnapshot(activeDocument.id);
    }
  }, [activeDocument, content, hasUnsavedChanges, saveDocument, createSnapshot]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!activeDocument || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, activeDocument, hasUnsavedChanges, handleSave]);

  if (!activeDocument) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="mx-auto mb-2 h-12 w-12 opacity-20" />
          <p>No document selected</p>
          <p className="mt-1 text-sm">Create a new document to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">{activeDocument.title}</h3>
          {hasUnsavedChanges && (
            <span className="text-xs text-yellow-500">● Unsaved</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center space-x-1 rounded px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
            title="Save (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleSnapshot}
            className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
            title="Create snapshot"
          >
            Create Snapshot
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="flex-1 resize-none bg-background p-4 font-mono text-sm outline-none"
        placeholder="Start writing..."
        spellCheck={false}
      />

      {/* Status Bar */}
      <div className="border-t border-border bg-card px-4 py-1 text-xs text-muted-foreground">
        {content.length} characters · {content.split('\n').length} lines
      </div>
    </div>
  );
}
