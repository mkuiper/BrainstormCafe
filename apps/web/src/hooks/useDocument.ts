import { useCallback, useEffect } from 'react';
import { useWebSocket, useWebSocketEvent } from './useWebSocket';
import { useDocumentStore } from '@/store/documentStore';
import { Document, DocumentType } from '@brainstorm-cafe/shared';

export function useDocument() {
  const { send } = useWebSocket();
  const { addDocument, updateDocument, setActiveDocument } = useDocumentStore();

  // Listen for document created events
  useWebSocketEvent('document.created', (event) => {
    if (event.type === 'document.created') {
      addDocument(event.payload.document);
      setActiveDocument(event.payload.document.id);
    }
  });

  // Listen for document snapshots
  useWebSocketEvent('document.snapshot', (event) => {
    if (event.type === 'document.snapshot') {
      const doc = event.payload.document;
      updateDocument(doc.id, doc.content);
    }
  });

  // Listen for document patches from other clients
  useWebSocketEvent('document.patch', (event) => {
    if (event.type === 'document.patch') {
      updateDocument(event.payload.documentId, event.payload.patch);
    }
  });

  const createDocument = useCallback(
    (title: string, type: DocumentType, template?: string) => {
      send({
        type: 'document.create',
        payload: { title, type, template },
      });
    },
    [send]
  );

  const saveDocument = useCallback(
    (documentId: string, content: string) => {
      send({
        type: 'document.update',
        payload: { documentId, content },
      });
    },
    [send]
  );

  const createSnapshot = useCallback(
    (documentId: string) => {
      send({
        type: 'document.version.create',
        payload: { documentId, trigger: 'manual' },
      });
    },
    [send]
  );

  return {
    createDocument,
    saveDocument,
    createSnapshot,
  };
}
