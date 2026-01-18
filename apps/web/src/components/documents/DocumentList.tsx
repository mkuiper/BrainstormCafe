'use client';

import { FileText, Plus } from 'lucide-react';
import { useDocumentStore } from '@/store/documentStore';
import { useDocument } from '@/hooks/useDocument';
import { useState } from 'react';
import { DocumentType } from '@brainstorm-cafe/shared';

export default function DocumentList() {
  const { documents, activeDocumentId, setActiveDocument } = useDocumentStore();
  const { createDocument } = useDocument();
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);

  const handleCreateDocument = (title: string, type: DocumentType) => {
    createDocument(title, type);
    setShowNewDocDialog(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documents</h3>
        <button
          onClick={() => setShowNewDocDialog(true)}
          className="rounded p-1 hover:bg-accent"
          title="New document"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No documents yet
        </p>
      ) : (
        <div className="space-y-1">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDocument(doc.id)}
              className={`flex w-full items-start space-x-2 rounded p-2 text-left text-sm hover:bg-accent ${
                activeDocumentId === doc.id ? 'bg-accent' : ''
              }`}
            >
              <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.type} · {new Date(doc.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Simple New Document Dialog */}
      {showNewDocDialog && (
        <NewDocumentDialog
          onClose={() => setShowNewDocDialog(false)}
          onCreate={handleCreateDocument}
        />
      )}
    </div>
  );
}

function NewDocumentDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, type: DocumentType) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('custom');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), type);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">New Document</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter document title"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="prd">PRD (Product Requirements)</option>
              <option value="spec">Technical Specification</option>
              <option value="ideas">Ideas & Brainstorming</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
