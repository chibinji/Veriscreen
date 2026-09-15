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

  async generateDocument(_type: DocumentType): Promise<Document> {
    fail(404, 'Generating documents is not available. The server lists verified documents and does not provide a generate endpoint.');
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
