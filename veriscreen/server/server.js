import os from 'os';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findStudent, initDatabase, pool } from './db.js';
import { buildConfirmationPdf, buildPaymentHistoryPdf, buildRecordPdf, buildResultsPdf } from './pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8081);
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-before-deploy';
const PUBLIC_URL = resolvePublicUrl();

function resolvePublicUrl() {
  const render = (process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
  if (render) return render;
  const configured = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  if (configured && !/localhost|127\.0\.0\.1/.test(configured)) return configured;
  const skip = /warp|virtual|vethernet|hyper-v|wsl|loopback|bluetooth|vmware|vbox/i;
  const candidates = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    if (skip.test(name)) continue;
    for (const net of list || []) {
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal) candidates.push(net.address);
    }
  }
  const lan = candidates.find((address) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(address));
  if (lan) return `http://${lan}:${PORT}`;
  return configured || `http://localhost:${PORT}`;
}
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
    pipelineStage: row.pipeline_stage || null,
    screeningExplanation: row.screening_explanation || null,
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

async function documentPdf(student, type, documentId, issuedAt) {
  const verifyUrl = `${PUBLIC_URL}/verify/${documentId}`;
  const [registrations] = await pool.query(
    'SELECT * FROM registrations WHERE student_id = ? ORDER BY registration_date',
    [student.id],
  );
  const latestRegistration = registrations[registrations.length - 1];
  const yearLabel = ordinal(yearOfStudy(student.enrollment_year)) + ' Year';
  const session = latestRegistration
    ? `${latestRegistration.academic_year} - Semester ${latestRegistration.semester}`
    : 'No session recorded';

  if (type === 'FEE_STATEMENT') {
    const [records] = await pool.query(
      'SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date',
      [student.id],
    );
    const payments = records.map((row) => {
      const paid = Number(row.amount || 0);
      const outstanding = Number(row.outstanding_balance || 0);
      return {
        description: row.description || `Tuition ${formatDate(row.payment_date)}`,
        currency: 'ZMW',
        amount: money(paid + outstanding),
        paid: money(paid),
        paidValue: paid,
        chargeValue: paid + outstanding,
        outstanding,
      };
    });
    const latest = records[records.length - 1];
    return buildPaymentHistoryPdf({
      studentId: student.id,
      studentName: student.name,
      yearOfStudy: yearLabel,
      session,
      payments,
      totalAmount: money(payments.reduce((sum, row) => sum + row.chargeValue, 0)),
      totalPaid: money(payments.reduce((sum, row) => sum + row.paidValue, 0)),
      balance: money(latest ? Number(latest.outstanding_balance || 0) : 0),
      verifyUrl,
      issuedAt,
    });
  }

  if (type === 'TRANSCRIPT') {
    const [results] = await pool.query(
      'SELECT * FROM academic_results WHERE student_id = ? ORDER BY academic_year, id',
      [student.id],
    );
    const [exams] = await pool.query(
      'SELECT * FROM examinations WHERE student_id = ?',
      [student.id],
    );
    const groups = new Map();
    for (const row of results) {
      const academicYear = row.academic_year || latestRegistration?.academic_year || 'Recorded results';
      if (!groups.has(academicYear)) {
        const exam = exams.find((item) => item.academic_year === academicYear);
        groups.set(academicYear, {
          academicYear,
          programme: student.program || '—',
          yearOfStudy: yearLabel.toUpperCase(),
          comment: resultComment(exam, row.grade),
          courses: [],
        });
      }
      const courseName = row.course_name && row.course_name !== row.course_code
        ? `${row.course_code} - ${row.course_name}`
        : (row.course_code || '—');
      groups.get(academicYear).courses.push({
        course: courseName,
        grade: row.grade || '—',
        credits: Number(row.credits || 0),
        points: gradePoint(row.grade),
      });
    }
    const flat = [...groups.values()].flatMap((group) => group.courses);
    const credits = flat.reduce((sum, course) => sum + course.credits, 0);
    const weighted = flat.reduce((sum, course) => sum + course.points * course.credits, 0);
    const gpa = credits > 0 ? (weighted / credits).toFixed(2) : '—';
    return buildResultsPdf({
      studentName: student.name,
      computerNumber: student.id,
      gender: student.gender || '—',
      continuousAssessmentNote: 'No continuous assessment rows are stored for this student.',
      gpaNote: `GPA is computed from the university record as (course credits x grade points) / sum of credits. Current GPA: ${gpa}`,
      groups: [...groups.values()],
      verifyUrl,
      issuedAt,
    });
  }

  if (type === 'EXAM_SLIP') {
    const [records] = await pool.query(
      'SELECT * FROM examinations WHERE student_id = ? ORDER BY academic_year',
      [student.id],
    );
    return buildRecordPdf({
      title: 'Examination Status',
      studentId: student.id,
      studentName: student.name,
      subtitle: `${student.program || 'Programme not recorded'}  |  ${yearLabel}`,
      columns: ['Academic year', 'Eligible', 'Status'],
      rows: records.map((row) => [row.academic_year || '—', row.eligible ? 'Yes' : 'No', row.status || '—']),
      verifyUrl,
      issuedAt,
    });
  }

  if (type === 'CONFIRMATION_SLIP') {
    const [results] = await pool.query(
      'SELECT course_code FROM academic_results WHERE student_id = ? ORDER BY id',
      [student.id],
    );
    const courses = results.map((row) => row.course_code).filter(Boolean);
    return buildConfirmationPdf({
      studentId: student.id,
      studentName: String(student.name || '').toUpperCase(),
      nrc: student.nrc || '—',
      programme: String(student.program || '—').toUpperCase(),
      school: String(student.faculty || '—').toUpperCase(),
      yearOfStudy: yearLabel,
      registration: latestRegistration?.confirmed ? 'CONFIRMED' : 'PENDING',
      registeredOn: latestRegistration
        ? `${latestRegistration.academic_year} semester ${latestRegistration.semester}`
        : '—',
      session: latestRegistration ? `${latestRegistration.academic_year} SESSION` : 'SESSION NOT RECORDED',
      courses: courses.length ? courses.join(', ') : '',
      verifyUrl,
      issuedAt,
    });
  }

  const [applications] = await pool.query(
    'SELECT * FROM helsb_applications WHERE student_id = ? ORDER BY id DESC LIMIT 1',
    [student.id],
  );
  const application = applications[0];
  return buildRecordPdf({
    title: 'HELSB Loan Contract',
    studentId: student.id,
    studentName: student.name,
    subtitle: application?.application_number || 'No loan application is stored',
    columns: ['Application', 'Status', 'Loan percent', 'Notes'],
    rows: application
      ? [[
        application.application_number || '—',
        application.application_status || '—',
        application.loan_percent == null ? '—' : String(application.loan_percent),
        application.contract_details || application.notes || '—',
      ]]
      : [],
    verifyUrl,
    issuedAt,
  });
}

function ordinal(value) {
  const number = Number(value);
  const mod = number % 100;
  const suffix = mod >= 11 && mod <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th';
  return `${number}${suffix}`;
}

function gradePoint(grade) {
  const points = { 'A+': 4, A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, 'C-': 1.7, 'D+': 1.3, D: 1, F: 0 };
  return points[grade] ?? 0;
}

function resultComment(exam, grade) {
  if (!grade) return 'NOT PUBLISHED';
  if (!exam) return '';
  return String(exam.status || '').replaceAll('_', ' ');
}

function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB');
}

function money(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

app.post('/api/v1/students/me/documents/generate/:type', requireStudent, async (req, res, next) => {
  try {
    const student = await findStudent(req.studentId);
    const type = String(req.params.type || 'TRANSCRIPT').toUpperCase();
    const documentId = `VS-${randomBytes(4).toString('hex').toUpperCase()}`;
    const generatedAt = new Date();
    const pdf = await documentPdf(student, type, documentId, generatedAt);
    fs.mkdirSync(storageDir, { recursive: true });
    const filePath = path.join(storageDir, `${documentId}.pdf`);
    fs.writeFileSync(filePath, pdf);
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
    if (!document) throw httpError(404, 'Document not found.');
    const student = await findStudent(req.studentId);
    const pdf = await documentPdf(
      student,
      String(document.type || 'TRANSCRIPT').toUpperCase(),
      document.document_id,
      document.generated_at,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.document_id}.pdf"`);
    res.setHeader('X-Document-Id', document.document_id);
    res.send(pdf);
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
         SET submitted_at = ?, submitted_document_ids = ?, mobile_money_phone = ?, mobile_money_provider = ?, application_status = ?, pipeline_stage = 'SUBMITTED'
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
           submitted_at, submitted_document_ids, mobile_money_phone, mobile_money_provider, loan_percent, pipeline_stage)
         VALUES (?, 'UNDER_REVIEW', 'PENDING', 'PENDING', ?, ?, ?, ?, ?, 0, 'SUBMITTED')`,
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
    const pdf = await buildRecordPdf({
      title: 'HELSB Loan Contract',
      studentId: student.id,
      studentName: student.name,
      subtitle: application.application_number || `Application ${application.id}`,
      columns: ['Application', 'Status', 'Details'],
      rows: [[
        application.application_number || String(application.id),
        application.application_status || '—',
        application.contract_details || 'Loan contract',
      ]],
      verifyUrl: `${PUBLIC_URL}/verify/HELSB-${application.id}`,
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
    const found = await findVerifiedDocument(req.params.documentId);
    res.json(found.payload);
  } catch (error) {
    next(error);
  }
});

app.get('/verify/:documentId', async (req, res, next) => {
  try {
    const found = await findVerifiedDocument(req.params.documentId);
    res.type('html').send(verificationPage(found.payload));
  } catch (error) {
    next(error);
  }
});

async function findVerifiedDocument(documentId) {
  const [rows] = await pool.query(
    `SELECT d.document_id, d.type, d.generated_at, s.name AS student_name, s.id AS student_id
     FROM documents d
     JOIN students s ON s.id = d.student_id
     WHERE d.document_id = ?`,
    [documentId],
  );
  const document = rows[0];
  const valid = Boolean(document);
  return {
    payload: {
      valid,
      documentId,
      documentType: document?.type || null,
      status: valid ? 'VALID' : 'INVALID',
      generatedAt: document?.generated_at || null,
      studentName: document?.student_name || null,
      studentNumber: document?.student_id || null,
    },
  };
}

function issuedLabel(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function verificationPage(payload) {
  const valid = payload.valid;
  const title = valid ? 'Document verified' : 'Document could not be verified';
  const detail = valid
    ? `${labelFor(payload.documentType)} for ${payload.studentName || 'the student'} is authentic.`
    : 'This code is not on a document issued by VeriScreen.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: ${valid ? '#e8f6ee' : '#fdecec'}; font-family: Georgia, "Times New Roman", serif; color: #163028; }
    main { width: min(440px, calc(100% - 32px)); text-align: center; padding: 36px 22px; }
    .mark { width: 92px; height: 92px; margin: 0 auto 18px; border-radius: 50%; display: grid; place-items: center; background: ${valid ? '#178a45' : '#b42318'}; color: white; font-size: 48px; }
    h1 { margin: 0 0 8px; font-size: 32px; color: ${valid ? '#0f7b3a' : '#b42318'}; }
    p { margin: 0 0 18px; line-height: 1.45; }
    dl { text-align: left; background: white; border-radius: 16px; padding: 14px 16px; }
    dl div { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #e6eee9; }
    dl div:last-child { border-bottom: 0; }
    dd { margin: 0; font-weight: 700; text-align: right; }
  </style>
</head>
<body>
  <main>
    <div class="mark">${valid ? '✓' : '!'}</div>
    <h1>${title}</h1>
    <p>${detail}</p>
    <dl>
      <div><dt>Document</dt><dd>${labelFor(payload.documentType)}</dd></div>
      <div><dt>Student</dt><dd>${payload.studentName || '—'}</dd></div>
      <div><dt>Computer number</dt><dd>${payload.studentNumber || '—'}</dd></div>
      <div><dt>Code</dt><dd>${payload.documentId}</dd></div>
      <div><dt>Issued</dt><dd>${issuedLabel(payload.generatedAt)}</dd></div>
    </dl>
  </main>
</body>
</html>`;
}

function labelFor(type) {
  const labels = {
    TRANSCRIPT: 'Academic results',
    FEE_STATEMENT: 'Fee statement',
    EXAM_SLIP: 'Examination slip',
    CONFIRMATION_SLIP: 'Confirmation of registration',
    CONTRACT: 'HELSB contract',
  };
  return labels[type] || 'Academic document';
}

app.post('/api/v1/internal/screen', async (req, res, next) => {
  try {
    const key = req.headers['x-internal-key'];
    if (key !== (process.env.INTERNAL_KEY || 'veriscreen-helsb-dev')) {
      throw httpError(401, 'Unauthorized');
    }
    const studentId = String(req.body?.studentId || '');
    if (!studentId) throw httpError(400, 'A student is required.');
    res.json(await explainScreening(studentId));
  } catch (error) {
    next(error);
  }
});

async function explainScreening(studentId) {
  const [fees] = await pool.query(
    'SELECT outstanding_balance FROM fees WHERE student_id = ? ORDER BY payment_date, id',
    [studentId],
  );
  const [registrations] = await pool.query(
    'SELECT confirmed FROM registrations WHERE student_id = ? ORDER BY registration_date, id',
    [studentId],
  );
  const [results] = await pool.query(
    'SELECT grade, credits FROM academic_results WHERE student_id = ?',
    [studentId],
  );
  const [exams] = await pool.query(
    'SELECT eligible, status FROM examinations WHERE student_id = ? ORDER BY academic_year',
    [studentId],
  );
  const latestFee = fees[fees.length - 1];
  const outstanding = latestFee ? Number(latestFee.outstanding_balance || 0) : null;
  const registered = Number(registrations[registrations.length - 1]?.confirmed) === 1;
  const latestExam = exams[exams.length - 1];
  const blockedExam = latestExam && (Number(latestExam.eligible) !== 1 || String(latestExam.status || '').includes('BLOCKED'));
  const credits = results.reduce((sum, row) => sum + Number(row.credits || 0), 0);
  const weighted = results.reduce((sum, row) => sum + gradePoint(row.grade) * Number(row.credits || 0), 0);
  const gpa = credits > 0 ? weighted / credits : null;
  const failing = results.some((row) => String(row.grade || '').toUpperCase() === 'F');

  if (outstanding == null) {
    return { approved: false, explanation: 'Not eligible: no fee record is available.' };
  }
  if (outstanding > 0) {
    return { approved: false, explanation: `Not eligible: outstanding fee balance of ${kwacha(outstanding)}` };
  }
  if (!registered) {
    return { approved: false, explanation: 'Not eligible: registration is not confirmed.' };
  }
  if (blockedExam) {
    return { approved: false, explanation: 'Not eligible: examinations are blocked.' };
  }
  if (!results.length || gpa == null || gpa < 2 || failing) {
    return { approved: false, explanation: 'Not eligible: academic standing is below the required level.' };
  }
  return { approved: true, explanation: 'Approved: good academic standing, fees cleared, registration confirmed.' };
}

function kwacha(value) {
  return `K${Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

app.post('/api/v1/internal/helsb-progress', async (req, res, next) => {
  try {
    const key = req.headers['x-internal-key'];
    if (key !== (process.env.INTERNAL_KEY || 'veriscreen-helsb-dev')) {
      throw httpError(401, 'Unauthorized');
    }
    const studentId = String(req.body?.studentId || '');
    const stage = String(req.body?.stage || '');
    const allowed = ['SUBMITTED', 'PORTAL_CONFIRMED', 'PAYMENT', 'SCREENING', 'CONTRACT', 'DISBURSEMENT'];
    if (!studentId || !allowed.includes(stage)) throw httpError(400, 'A student and tracker stage are required.');
    const [rows] = await pool.query(
      'SELECT id FROM helsb_applications WHERE student_id = ? ORDER BY id DESC LIMIT 1',
      [studentId],
    );
    if (rows[0]) {
      await pool.query(
        'UPDATE helsb_applications SET pipeline_stage = ?, screening_explanation = COALESCE(?, screening_explanation) WHERE id = ?',
        [stage, req.body?.explanation || null, rows[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO helsb_applications (student_id, application_status, pipeline_stage, application_number, submitted_at, screening_explanation)
         VALUES (?, 'UNDER_REVIEW', ?, ?, NOW(), ?)`,
        [studentId, stage, req.body?.applicationNumber || null, req.body?.explanation || null],
      );
    }
    res.json({ ok: true, stage });
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
      console.log(`Phone verification address: ${PUBLIC_URL}`);
    });
  })
  .catch((error) => {
    console.error('Could not start. Check the database settings.');
    console.error(error.message);
    process.exit(1);
  });
