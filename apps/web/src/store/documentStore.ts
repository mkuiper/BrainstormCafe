import { create } from 'zustand';
import { Document } from '@brainstorm-cafe/shared';

interface DocumentState {
  documents: Document[];
  activeDocumentId: string | null;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, content: string) => void;
  setActiveDocument: (id: string | null) => void;
  getActiveDocument: () => Document | null;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocumentId: null,

  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  updateDocument: (id, content) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, content, updatedAt: new Date() } : doc
      ),
    })),

  setActiveDocument: (id) => set({ activeDocumentId: id }),

  getActiveDocument: () => {
    const state = get();
    return state.documents.find((doc) => doc.id === state.activeDocumentId) ?? null;
  },
}));
