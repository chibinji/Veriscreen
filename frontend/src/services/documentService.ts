import { documentsApi } from '../api';
import type { Document, DocumentType } from '../types';

export const documentService = {
  getMyDocuments: (): Promise<Document[]> => documentsApi.getDocuments(),
  generateDocument: (type: DocumentType) => documentsApi.generateDocument(type),
  downloadDocument: (id: number, filename: string) => documentsApi.downloadDocument(id, filename),
  previewDocument: (id: number) => documentsApi.previewDocument(id),
  getDocumentById: (id: number) => documentsApi.getDocumentById(id),
  revokeDocument: (id: number) => documentsApi.deleteDocument(id),
};
