import type { Document, DocumentType, StudentProfile } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { getDb } from '../data/store';

export function buildDocumentHtml(doc: Document, profile?: StudentProfile): string {
  const db = getDb();
  const student =
    profile || db.profiles.find((item) => item.studentNumber === doc.studentNumber);
  const results = db.academicResults.filter((item) => item.studentNumber === doc.studentNumber);
  const fees = db.feeRecords.filter((item) => item.studentNumber === doc.studentNumber);
  const exams = db.examRecords.filter((item) => item.studentNumber === doc.studentNumber);
  const regs = db.registrationRecords.filter((item) => item.studentNumber === doc.studentNumber);
  const title = DOCUMENT_TYPES[doc.type] || doc.type;
  const issued = new Date(doc.generatedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let body: string;
  if (doc.type === 'TRANSCRIPT') {
    body = `
      <table>
        <thead><tr><th>Code</th><th>Course</th><th>Year</th><th>Sem</th><th>Credits</th><th>Grade</th></tr></thead>
        <tbody>
          ${results.map((r) => `<tr><td>${r.courseCode}</td><td>${r.courseName}</td><td>${r.academicYear}</td><td>${r.semester}</td><td>${r.credits}</td><td>${r.grade}</td></tr>`).join('')}
        </tbody>
      </table>
      <p><strong>Cumulative GPA:</strong> ${student?.gpa ?? '—'}</p>`;
  } else if (doc.type === 'FEE_STATEMENT') {
    body = `
      <table>
        <thead><tr><th>Description</th><th>Year</th><th>Amount (ZMW)</th><th>Paid (ZMW)</th><th>Receipt</th><th>Status</th></tr></thead>
        <tbody>
          ${fees.map((f) => `<tr><td>${f.description}</td><td>${f.academicYear} Sem ${f.semester}</td><td>${f.amount.toFixed(2)}</td><td>${f.paidAmount.toFixed(2)}</td><td>${f.receiptNumber || '—'}</td><td>${f.status}</td></tr>`).join('')}
        </tbody>
      </table>`;
  } else if (doc.type === 'EXAM_SLIP') {
    body = `
      <table>
        <thead><tr><th>Code</th><th>Course</th><th>Date</th><th>Venue</th><th>Status</th></tr></thead>
        <tbody>
          ${exams.map((e) => `<tr><td>${e.courseCode}</td><td>${e.courseName}</td><td>${e.examDate}</td><td>${e.venue}</td><td>${e.sittingStatus}</td></tr>`).join('')}
        </tbody>
      </table>`;
  } else if (doc.type === 'CONFIRMATION_SLIP') {
    body = `
      <table>
        <thead><tr><th>Academic Year</th><th>Semester</th><th>Status</th><th>Registered</th></tr></thead>
        <tbody>
          ${regs.map((r) => `<tr><td>${r.academicYear}</td><td>${r.semester}</td><td>${r.confirmationStatus}</td><td>${r.registeredAt ? new Date(r.registeredAt).toLocaleDateString('en-GB') : '—'}</td></tr>`).join('')}
        </tbody>
      </table>
      <p>This student is confirmed as a registered student of the University of Zambia.</p>`;
  } else {
    body = `<p>This digitally sealed HELSB loan contract confirms the award attached to application records for ${doc.studentName}.</p>
      <p>The student agrees to the terms of the Higher Education Loans and Scholarships Board Act (2016).</p>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} — ${doc.studentName}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; margin: 32px; color: #1a1a1a; }
    header { border-bottom: 3px solid #0d6efd; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    h1 { font-size: 20px; margin: 0; color: #0d47a1; }
    h2 { font-size: 15px; margin: 4px 0 0; font-weight: normal; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #e9f2ff; }
    .seal { border: 2px dashed #0d6efd; padding: 12px; margin-top: 28px; font-size: 12px; }
    .muted { color: #555; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>University of Zambia</h1>
      <h2>VeriScreen Digital Academic Document</h2>
      <p class="muted">${title}</p>
    </div>
    <div class="muted" style="text-align:right">
      <div><strong>Verification ID</strong></div>
      <div>${doc.verificationCode}</div>
      <div>Issued ${issued}</div>
    </div>
  </header>
  <p><strong>Student:</strong> ${doc.studentName} &nbsp;|&nbsp; <strong>Student No:</strong> ${doc.studentNumber}</p>
  ${student ? `<p><strong>Programme:</strong> ${student.program}<br/><strong>Faculty:</strong> ${student.faculty}<br/><strong>NRC:</strong> ${student.nrc}</p>` : ''}
  ${body}
  <div class="seal">
    Digitally sealed by VeriScreen · QR/ID ${doc.verificationCode} · Status ${doc.status} ·
    Tamper-evident record. Verify at /verify/${doc.verificationCode}
  </div>
</body>
</html>`;
}

export function documentBlob(doc: Document): Blob {
  return new Blob([buildDocumentHtml(doc)], { type: 'text/html' });
}

export function makeVerificationCode(type: DocumentType): string {
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  const prefix = type === 'CONTRACT' ? 'VS-HELSB' : 'VS-UNZA';
  return `${prefix}-${rand}`;
}
