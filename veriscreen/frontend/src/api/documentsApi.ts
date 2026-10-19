import type { Document, DocumentType } from '../types';
import { downloadBlob } from '../utils';
import { fail, getSessionUser, requireSession } from './mockClient';
import { API_ENDPOINTS } from '../constants';
import apiClient from '../services/apiClient';
import { toDocument, type BackendDocument } from './mappers';

const documentSummaries = new Map<number, { summary: string; url?: string; typeLabel: string }>();

function studentNameFromSession(): { studentNumber: string; studentName: string } {
  const session = getSessionUser();
  const studentNumber = session?.studentNumber || session?.username || '';
  const studentName = session ? `${session.firstName} ${session.lastName}`.trim() : '';
  return { studentNumber, studentName };
}

async function fetchPdf(officialId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    `/api/v1/students/me/documents/${officialId}/download`,
    { responseType: 'blob' },
  );
  return data.type === 'application/pdf' ? data : new Blob([data], { type: 'application/pdf' });
}

export const documentsApi = {
  async getDocuments(): Promise<Document[]> {
    requireSession();
    const { studentNumber, studentName } = studentNameFromSession();
    const { data } = await apiClient.get<BackendDocument[]>(API_ENDPOINTS.ME_DOCUMENTS);
    documentSummaries.clear();
    return data.map((item, index) => {
      const doc = toDocument(item, index, studentNumber, studentName);
      documentSummaries.set(doc.id, {
        summary: item.summary || '',
        url: item.url || undefined,
        typeLabel: item.type,
      });
      return doc;
    });
  },

  async getDocumentById(id: number): Promise<Document> {
    const documents = await this.getDocuments();
    const doc = documents.find((item) => item.id === id);
    if (!doc) fail(404, 'Document not found.');
    return doc;
  },

  async generateDocument(type: DocumentType): Promise<Document & { documentId: string }> {
    requireSession();
    const { data } = await apiClient.post<{ documentId: string; generatedAt?: string }>(
      `/api/v1/students/me/documents/generate/${type}`,
    );
    const documents = await this.getDocuments();
    const created = documents.find((item) => item.officialId === data.documentId);
    return {
      ...(created || {
        id: 0,
        type,
        studentNumber: '',
        studentName: '',
        generatedAt: data.generatedAt || new Date().toISOString(),
        verificationCode: data.documentId,
        status: 'GENERATED',
        officialId: data.documentId,
      }),
      documentId: data.documentId,
    };
  },

  async downloadDocument(id: number, filename: string): Promise<void> {
    const documents = await this.getDocuments();
    const doc = documents.find((item) => item.id === id);
    if (!doc) fail(404, 'Document not found.');
    if (!doc.officialId) fail(404, 'This PDF is not available yet.');
    const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    downloadBlob(await fetchPdf(doc.officialId), name);
  },

  async previewDocument(id: number): Promise<string> {
    const documents = await this.getDocuments();
    const doc = documents.find((item) => item.id === id);
    if (!doc?.officialId) fail(404, 'This PDF is not available yet.');
    return URL.createObjectURL(await fetchPdf(doc.officialId));
  },

  async deleteDocument(_id: number): Promise<void> {
    fail(404, 'Revoking documents is not available. The server does not provide a delete endpoint.');
  },
};
