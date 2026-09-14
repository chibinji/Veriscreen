import { documentsApi } from '../api';
import type { Document, DocumentType } from '../types';

export const documentService = {
  getMyDocuments: (): Promise<Document[]> => documentsApi.getDocuments(),
  generateDocument: (type: DocumentType) => documentsApi.generateDocument(type),
  generateAndDownload: (type: DocumentType) => documentsApi.generateAndDownload(type),
  fetchOfficialPdf: (documentId: string) => documentsApi.fetchOfficialPdf(documentId),
  downloadDocument: (id: number, filename: string) => documentsApi.downloadDocument(id, filename),
  downloadOfficialDocument: (documentId: string, filename?: string) =>
    documentsApi.downloadOfficialDocument(documentId, filename),
  previewDocument: (id: number) => documentsApi.previewDocument(id),
  getDocumentById: (id: number) => documentsApi.getDocumentById(id),
  revokeDocument: (id: number) => documentsApi.deleteDocument(id),
};
