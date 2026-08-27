import type { Document, DocumentType } from '../types';
import { downloadBlob } from '../utils';
import { fail, getSessionUser, requireSession } from './mockClient';
import { API_ENDPOINTS } from '../constants';
import apiClient, { toApiException } from '../services/apiClient';
import { toDocument, type BackendDocument } from './mappers';
import { ApiException } from './mockClient';

const documentSummaries = new Map<number, { summary: string; url?: string; typeLabel: string }>();

const GENERATE_PATH: Record<string, string> = {
  CONFIRMATION_SLIP: 'confirmation',
  RESULTS: 'results',
  TRANSCRIPT: 'results',
  EXAMINATION_SLIP: 'examination',
  EXAM_SLIP: 'examination',
  PAYMENT_HISTORY: 'payment-history',
  FEE_STATEMENT: 'payment-history',
};

export interface GeneratedOfficialDocument {
  documentId: string;
  documentType: string;
  status: string;
  generatedAt: string;
}

function studentNameFromSession(): { studentNumber: string; studentName: string } {
  const session = getSessionUser();
  const studentNumber = session?.studentNumber || session?.username || '';
  const studentName = session ? `${session.firstName} ${session.lastName}`.trim() : '';
  return { studentNumber, studentName };
}

function previewHtml(doc: Document, summary: string): string {
  const title = doc.type.replace(/_/g, ' ');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; margin: 32px; color: #1a1a1a; }
    header { border-bottom: 3px solid #0d6efd; padding-bottom: 12px; margin-bottom: 24px; }
    h1 { font-size: 20px; margin: 0; color: #0d47a1; }
    .muted { color: #555; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <h1>University of Zambia</h1>
    <p class="muted">${title}</p>
  </header>
  <p><strong>Student:</strong> ${doc.studentName || doc.studentNumber}</p>
  <p><strong>Generated:</strong> ${doc.generatedAt}</p>
  <p>${summary || 'No summary available.'}</p>
</body>
</html>`;
}

async function readBlobError(error: unknown): Promise<never> {
  const axiosError = error as {
    response?: { status?: number; data?: Blob | { message?: string } };
    message?: string;
  };
  const data = axiosError.response?.data;
  if (data instanceof Blob) {
    const text = await data.text();
    try {
      const json = JSON.parse(text) as { message?: string };
      throw new ApiException(axiosError.response?.status ?? 0, json.message || 'Document request failed.');
    } catch (parseError) {
      if (parseError instanceof ApiException) throw parseError;
      throw new ApiException(axiosError.response?.status ?? 0, text || 'Document request failed.');
    }
  }
  throw toApiException(error);
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

  async generateDocument(type: DocumentType): Promise<GeneratedOfficialDocument> {
    requireSession();
    const pathType = GENERATE_PATH[type];
    if (!pathType) {
      fail(400, 'This document type cannot be generated.');
    }
    const { data } = await apiClient.post<GeneratedOfficialDocument>(API_ENDPOINTS.GENERATE_DOCUMENT(pathType));
    return data;
  },

  async downloadOfficialDocument(documentId: string, filename?: string): Promise<void> {
    requireSession();
    try {
      const { data } = await apiClient.get<Blob>(API_ENDPOINTS.DOWNLOAD_DOCUMENT(documentId), {
        responseType: 'blob',
      });
      downloadBlob(data, filename || `${documentId}.pdf`);
    } catch (error) {
      await readBlobError(error);
    }
  },

  async generateAndDownload(type: DocumentType): Promise<GeneratedOfficialDocument> {
    const generated = await this.generateDocument(type);
    await this.downloadOfficialDocument(generated.documentId, `${generated.documentId}.pdf`);
    return generated;
  },

  async fetchOfficialPdf(documentId: string): Promise<Blob> {
    requireSession();
    try {
      const { data } = await apiClient.get<Blob>(API_ENDPOINTS.DOWNLOAD_DOCUMENT(documentId), {
        responseType: 'blob',
      });
      return data;
    } catch (error) {
      await readBlobError(error);
    }
  },

  async downloadDocument(id: number, filename: string): Promise<void> {
    const documents = await this.getDocuments();
    const doc = documents.find((item) => item.id === id);
    if (!doc) fail(404, 'Document not found.');
    const extra = documentSummaries.get(id);
    if (extra?.url) {
      window.open(extra.url, '_blank', 'noopener');
      return;
    }
    const name = filename.endsWith('.html') || filename.endsWith('.pdf')
      ? filename.replace(/\.pdf$/i, '.html')
      : `${filename}.html`;
    downloadBlob(new Blob([previewHtml(doc, extra?.summary || doc.verificationCode)], { type: 'text/html' }), name);
  },

  async previewDocument(id: number): Promise<string> {
    const documents = await this.getDocuments();
    const doc = documents.find((item) => item.id === id);
    if (!doc) fail(404, 'Document not found.');
    const extra = documentSummaries.get(id);
    if (extra?.url) return extra.url;
    return URL.createObjectURL(
      new Blob([previewHtml(doc, extra?.summary || doc.verificationCode)], { type: 'text/html' })
    );
  },

  async deleteDocument(_id: number): Promise<void> {
    fail(404, 'Revoking documents is not available. The server does not provide a delete endpoint.');
  },
};
