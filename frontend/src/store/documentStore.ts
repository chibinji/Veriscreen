import { create } from 'zustand';
import type { Document } from '../types';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  isGenerating: boolean;
  setDocuments: (docs: Document[]) => void;
  setSelected: (doc: Document | null) => void;
  setGenerating: (val: boolean) => void;
  addDocument: (doc: Document) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  selectedDocument: null,
  isGenerating: false,

  setDocuments: (documents) => set({ documents }),
  setSelected: (selectedDocument) => set({ selectedDocument }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
}));
