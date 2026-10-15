import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findStudent, initDatabase, pool } from './db.js';
import { buildPdf } from './pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8081);
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-before-deploy';
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const storageDir = path.join(__dirname, 'storage');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function signToken(studentId) {
  return jwt.sign({ sub: studentId }, JWT_SECRET, { expiresIn: '12h' });
}

function requireStudent(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(httpError(401, 'Sign in required.'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.studentId = payload.sub;
    if (req.params.studentId && req.params.studentId !== req.studentId) {
      return next(httpError(403, 'You can only open your own record.'));
    }
    next();
  } catch {
    next(httpError(401, 'Sign in required.'));
  }
}

function yearOfStudy(enrollmentYear) {
  if (!enrollmentYear) return 1;
  return Math.max(1, Math.min(new Date().getFullYear() - enrollmentYear + 1, 8));
}

function profileDto(student) {
  return {
    id: student.id,
    name: student.name,
    nrc: student.nrc,
    program: student.program,
    faculty: student.faculty,
    enrollmentYear: student.enrollment_year,
    registrationStatus: student.registration_status || 'ACTIVE',
    yearOfStudy: yearOfStudy(student.enrollment_year),
    email: student.email,
    phone: student.phone,
    nextOfKinName: student.next_of_kin_name,
    nextOfKinRelationship: student.next_of_kin_relationship,
    nextOfKinPhone: student.next_of_kin_phone,
    nextOfKinNrc: student.next_of_kin_nrc,
    nextOfKinAddress: student.next_of_kin_address,
  };
}

function helsbDto(row, student) {
  const status = (row.application_status || '').toUpperCase();
  const approved = status === 'APPROVED' || status === 'COMPLETED' || status === 'CONTRACT_GENERATED';
  return {
    id: row.id,
    applicationStatus: row.application_status,
    paymentStatus: row.payment_status,
    screeningResult: row.screening_result,
    contractDetails: row.contract_details,
    applicationNumber: row.application_number,
    notes: row.notes,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    loanPercent: row.loan_percent,
    hasLoan: approved,
    mobileMoneyPhone: row.mobile_money_phone,
    mobileMoneyProvider: row.mobile_money_provider,
    submittedDocumentIds: row.submitted_document_ids,
    contractAvailable: approved,
    studentName: student?.name,
    studentId: student?.id,
    nrc: student?.nrc,
    programme: student?.program,
    faculty: student?.faculty,
    email: student?.email,
    phone: student?.phone,
  };
}

async function loadHelsb(studentId) {
  const student = await findStudent(studentId);
  const [rows] = await pool.query(
    'SELECT * FROM helsb_applications WHERE student_id = ? ORDER BY id DESC',
    [studentId],
  );
  return rows.map((row) => helsbDto(row, student));
}

app.post(['/api/v1/auth/login', '/api/auth/login'], async (req, res, next) => {
  try {
    const id = String(req.body?.id || '').trim();
    const password = String(req.body?.password || '');
    const student = await findStudent(id);
    if (!student || !bcrypt.compareSync(password, student.password_hash)) {
      throw httpError(401, 'Invalid student ID or password. Please try again.');
    }
    res.json({ accessToken: signToken(student.id) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/profile', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    if (!student) throw httpError(404, 'Student not found.');
    res.json(profileDto(student));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/:studentId/profile', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    if (!student) throw httpError(404, 'Student not found.');
    res.json(profileDto(student));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/registrations', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM registrations WHERE student_id = ? ORDER BY registration_date',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      id: row.id,
      academicYear: row.academic_year,
      semester: row.semester,
      confirmed: Boolean(row.confirmed),
      registrationDate: row.registration_date,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/fees', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      id: row.id,
      paymentDate: row.payment_date,
      amount: Number(row.amount),
      receiptNo: row.receipt_no,
      outstandingBalance: Number(row.outstanding_balance),
      description: row.description,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/examinations', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM examinations WHERE student_id = ? ORDER BY academic_year',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      id: row.id,
      academicYear: row.academic_year,
      eligible: Boolean(row.eligible),
      status: row.status,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/academic-results', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM academic_results WHERE student_id = ? ORDER BY id',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      id: row.id,
      courseCode: row.course_code,
      courseName: row.course_name,
      grade: row.grade,
      credits: row.credits,
      academicYear: row.academic_year,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/helsb', requireStudent, async (req, res, next) => {
  try {
    res.json(await loadHelsb(req.studentId));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/documents', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM documents WHERE student_id = ? ORDER BY generated_at DESC',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      type: row.type,
      url: null,
      summary: row.summary || row.document_id,
      generatedDate: row.generated_at,
      documentId: row.document_id,
    })));
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/students/me/documents/generate/:type', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    const type = String(req.params.type || 'TRANSCRIPT').toUpperCase();
    const documentId = `VS-${randomBytes(4).toString('hex').toUpperCase()}`;
    const verifyUrl = `${PUBLIC_URL}/api/verify/${documentId}`;
    const pdf = await buildPdf({
      title: type.replace(/_/g, ' '),
      lines: [
        `Student: ${student.name}`,
        `Student ID: ${student.id}`,
        `Programme: ${student.program}`,
        `Document ID: ${documentId}`,
      ],
      verifyUrl,
    });
    fs.mkdirSync(storageDir, { recursive: true });
    const filePath = path.join(storageDir, `${documentId}.pdf`);
    fs.writeFileSync(filePath, pdf);
    const generatedAt = new Date();
    await pool.query(
      `INSERT INTO documents (student_id, document_id, type, summary, generated_at, file_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student.id, documentId, type, documentId, generatedAt, filePath],
    );
    await pool.query(
      `INSERT INTO notifications (student_id, title, message, type, channel, is_read, link, created_at)
       VALUES (?, ?, ?, 'SUCCESS', 'IN_APP', 0, '/student/documents', ?)`,
      [student.id, 'Document verified', `${type.replace(/_/g, ' ')} ${documentId} was issued.`, generatedAt],
    );
    res.json({ documentId, documentType: type, status: 'GENERATED', generatedAt });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/documents/:documentId/download', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM documents WHERE student_id = ? AND document_id = ?',
      [req.studentId, req.params.documentId],
    );
    const document = rows[0];
    if (!document || !document.file_path || !fs.existsSync(document.file_path)) {
      throw httpError(404, 'Document not found.');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.document_id}.pdf"`);
    res.setHeader('X-Document-Id', document.document_id);
    fs.createReadStream(document.file_path).pipe(res);
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/students/me/helsb/submit', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    const documentIds = Array.isArray(req.body?.documentIds) ? req.body.documentIds.join(',') : '';
    const [existing] = await pool.query(
      'SELECT * FROM helsb_applications WHERE student_id = ? ORDER BY id DESC LIMIT 1',
      [req.studentId],
    );
    const submittedAt = new Date();
    if (existing[0]) {
      const status = (existing[0].application_status || '').toUpperCase();
      const nextStatus = status === 'APPROVED' || status === 'COMPLETED' ? status : 'UNDER_REVIEW';
      await pool.query(
        `UPDATE helsb_applications
         SET submitted_at = ?, submitted_document_ids = ?, mobile_money_phone = ?, mobile_money_provider = ?, application_status = ?
         WHERE id = ?`,
        [
          submittedAt,
          documentIds,
          req.body?.mobileMoneyPhone || null,
          req.body?.mobileMoneyProvider || null,
          nextStatus,
          existing[0].id,
        ],
      );
    } else {
      await pool.query(
        `INSERT INTO helsb_applications
          (student_id, application_status, payment_status, screening_result, application_number,
           submitted_at, submitted_document_ids, mobile_money_phone, mobile_money_provider, loan_percent)
         VALUES (?, 'UNDER_REVIEW', 'PENDING', 'PENDING', ?, ?, ?, ?, ?, 0)`,
        [
          req.studentId,
          `HELSB-${submittedAt.getFullYear()}-${String(Date.now()).slice(-6)}`,
          submittedAt,
          documentIds,
          req.body?.mobileMoneyPhone || null,
          req.body?.mobileMoneyProvider || null,
        ],
      );
    }
    await pool.query(
      `INSERT INTO notifications (student_id, title, message, type, channel, is_read, link, created_at)
       VALUES (?, 'Data shared with HELSB', 'Your verified documents were submitted with your consent.', 'SUCCESS', 'IN_APP', 0, '/student/applications', ?)`,
      [req.studentId, submittedAt],
    );
    const applications = await loadHelsb(student.id);
    res.json(applications[0]);
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/helsb/:id/contract', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    const [rows] = await pool.query(
      'SELECT * FROM helsb_applications WHERE id = ? AND student_id = ?',
      [req.params.id, req.studentId],
    );
    const application = rows[0];
    if (!application) throw httpError(404, 'Application not found.');
    const pdf = await buildPdf({
      title: 'HELSB loan contract',
      lines: [
        `Student: ${student.name}`,
        `Application: ${application.application_number || application.id}`,
        `Status: ${application.application_status}`,
        application.contract_details || 'Loan contract',
      ],
      verifyUrl: `${PUBLIC_URL}/api/verify/HELSB-${application.id}`,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="HELSB-loan-contract.pdf"');
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/students/me/helsb/:id/contract/email', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    const [rows] = await pool.query(
      'SELECT * FROM helsb_applications WHERE id = ? AND student_id = ?',
      [req.params.id, req.studentId],
    );
    if (!rows[0]) throw httpError(404, 'Application not found.');
    await pool.query(
      `INSERT INTO notifications (student_id, title, message, type, channel, is_read, link, created_at)
       VALUES (?, 'Contract emailed', ?, 'INFO', 'EMAIL', 0, '/student/applications', NOW())`,
      [req.studentId, `A copy of the loan contract was prepared for ${student.email}.`],
    );
    const applications = await loadHelsb(req.studentId);
    res.json(applications.find((item) => item.id === Number(req.params.id)) || applications[0]);
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/students/me/notifications', requireStudent, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC',
      [req.studentId],
    );
    res.json(rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      channel: row.channel,
      read: Boolean(row.is_read),
      link: row.link,
      createdAt: row.created_at,
    })));
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/students/me/notifications/:id/read', requireStudent, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?',
      [req.params.id, req.studentId],
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/verify/:documentId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT document_id, type, generated_at FROM documents WHERE document_id = ?',
      [req.params.documentId],
    );
    const document = rows[0];
    const valid = Boolean(document);
    const payload = {
      valid,
      documentId: req.params.documentId,
      documentType: document?.type || null,
      status: valid ? 'VALID' : 'INVALID',
      generatedAt: document?.generated_at || null,
    };
    if ((req.headers.accept || '').includes('text/html')) {
      const tone = valid ? '#0f7b3a' : '#b42318';
      const title = valid ? 'Document verified' : 'Document could not be verified';
      res.type('html').send(`<!DOCTYPE html>
        <html lang="en"><head><meta charset="utf-8"><title>VeriScreen verification</title></head>
        <body style="font-family:Arial,sans-serif;background:#f3efe9;padding:32px">
          <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;padding:28px">
            <h1 style="color:${tone}">${title}</h1>
            <p><strong>Document ID:</strong> ${payload.documentId}</p>
            <p><strong>Document type:</strong> ${payload.documentType || '—'}</p>
            <p><strong>Status:</strong> ${payload.status}</p>
          </div>
        </body></html>`);
      return;
    }
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

const dist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: error.message || 'Server error' });
});

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VeriScreen Node API listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Could not start. Check the database settings.');
    console.error(error.message);
    process.exit(1);
  });
