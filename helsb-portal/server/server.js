import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findSchool, findUniversity, UNIVERSITIES } from './catalog.js';
import { findOfficer, initDatabase, pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8083);
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-before-deploy';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireOfficer(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(httpError(401, 'Sign in required.'));
  try {
    req.officer = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    next(httpError(401, 'Sign in required.'));
  }
}

function toDto(row) {
  const documentIds = String(row.document_ids || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    id: row.id,
    applicationNumber: row.application_number,
    veriscreenApplicationId: row.veriscreen_application_id,
    studentId: row.student_id,
    studentName: row.student_name,
    nrc: row.nrc,
    programme: row.programme,
    faculty: row.faculty,
    universityCode: row.university_code,
    schoolCode: row.school_code,
    schoolName: row.school_name,
    screeningPercent: row.screening_percent,
    screeningApproved: Boolean(row.screening_approved),
    status: row.status,
    documentIds,
    notes: row.notes,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };
}

async function applicationsFor(universityCode, schoolCode) {
  const [rows] = await pool.query(
    `SELECT * FROM applications
     WHERE university_code = ? AND school_code = ?
     ORDER BY submitted_at DESC`,
    [universityCode, schoolCode],
  );
  return rows;
}

function universityDto(university) {
  return {
    code: university.code,
    name: university.name,
    abbreviation: university.abbreviation,
    schoolCount: university.schools.length,
  };
}

async function schoolDto(universityCode, school) {
  const rows = await applicationsFor(universityCode, school.code);
  return {
    code: school.code,
    name: school.name,
    applicationCount: rows.length,
    newApplicationCount: rows.filter((row) => row.status === 'PENDING').length,
  };
}

app.post('/api/v1/auth/login', async (req, res, next) => {
  try {
    const username = String(req.body?.id || '').trim().toLowerCase();
    const officer = await findOfficer(username);
    if (!officer || !bcrypt.compareSync(String(req.body?.password || ''), officer.password_hash)) {
      throw httpError(401, 'Invalid username or password.');
    }
    res.json({
      accessToken: jwt.sign({ sub: officer.username }, JWT_SECRET, { expiresIn: '24h' }),
      fullName: officer.full_name,
      role: officer.role,
      username: officer.username,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/officer/universities', requireOfficer, (_req, res) => {
  res.json(UNIVERSITIES.map(universityDto));
});

app.get('/api/v1/officer/universities/:code', requireOfficer, async (req, res, next) => {
  try {
    const university = findUniversity(req.params.code);
    if (!university) throw httpError(404, 'University not found.');
    const schools = [];
    for (const school of university.schools) schools.push(await schoolDto(university.code, school));
    res.json({ university: universityDto(university), schools });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/officer/universities/:universityCode/schools/:schoolCode/applications', requireOfficer, async (req, res, next) => {
  try {
    const university = findUniversity(req.params.universityCode);
    const school = university && findSchool(university, req.params.schoolCode);
    if (!university || !school) throw httpError(404, 'School not found.');
    const rows = await applicationsFor(university.code, school.code);
    res.json({
      university: universityDto(university),
      school: await schoolDto(university.code, school),
      totalApplications: rows.length,
      newApplications: rows.filter((row) => row.status === 'PENDING').map(toDto),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/officer/universities/:universityCode/schools/:schoolCode/programmes', requireOfficer, async (req, res, next) => {
  try {
    const university = findUniversity(req.params.universityCode);
    const school = university && findSchool(university, req.params.schoolCode);
    if (!university || !school) throw httpError(404, 'School not found.');
    const rows = await applicationsFor(university.code, school.code);
    res.json({
      university: universityDto(university),
      school: await schoolDto(university.code, school),
      programmes: school.programmes.map((programme) => ({
        code: programme.code,
        name: programme.name,
        loanStudentCount: new Set(
          rows
            .filter((row) => row.status !== 'REJECTED' && matchesProgramme(row, programme))
            .map((row) => row.student_id),
        ).size,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/officer/universities/:universityCode/schools/:schoolCode/programmes/:programmeCode/students', requireOfficer, async (req, res, next) => {
  try {
    const university = findUniversity(req.params.universityCode);
    const school = university && findSchool(university, req.params.schoolCode);
    const programme = school?.programmes.find((item) => item.code.toLowerCase() === req.params.programmeCode.toLowerCase());
    if (!programme) throw httpError(404, 'Programme not found.');
    const rows = await applicationsFor(university.code, school.code);
    res.json(rows.filter((row) => matchesProgramme(row, programme)).map(toDto));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/officer/applications/:id', requireOfficer, async (req, res, next) => {
  try {
    const application = await requireApplication(req.params.id);
    if (String(req.query.startReview) === 'true' && application.status === 'PENDING') {
      await changeStatus(application, 'UNDER_REVIEW', 'system', 'Opened for screening');
    }
    const current = await requireApplication(req.params.id);
    const [history] = await pool.query(
      'SELECT * FROM status_history WHERE application_id = ? ORDER BY changed_at',
      [current.id],
    );
    res.json({
      application: toDto(current),
      history: history.map((row) => ({
        id: row.id,
        fromStatus: row.from_status,
        toStatus: row.to_status,
        changedBy: row.changed_by,
        comment: row.comment,
        changedAt: row.changed_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/officer/applications/:id/approve-screening', requireOfficer, async (req, res, next) => {
  try {
    const application = await requireApplication(req.params.id);
    await pool.query('UPDATE applications SET screening_approved = 1 WHERE id = ?', [application.id]);
    if (application.status === 'CONFIRMED' || application.status === 'REJECTED') {
      res.json(toDto(await requireApplication(application.id)));
      return;
    }
    const comment = req.body?.comment || 'Screening request approved';
    res.json(toDto(await decide(application.id, req.officer, 'CONFIRMED', comment)));
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/officer/applications/:id/reject', requireOfficer, async (req, res, next) => {
  try {
    const comment = String(req.body?.comment || '').trim();
    if (!comment) throw httpError(400, 'A reason is required when rejecting an application');
    res.json(toDto(await decide(req.params.id, req.officer, 'REJECTED', comment)));
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/inbound/health', (_req, res) => {
  res.json({ status: 'ok', service: 'helsb-portal' });
});

function matchesProgramme(row, programme) {
  const value = String(row.programme || '').trim().toLowerCase();
  return value === programme.name.toLowerCase() || value === programme.code.toLowerCase();
}

async function requireApplication(id) {
  const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
  if (!rows[0]) throw httpError(404, 'Application not found.');
  return rows[0];
}

async function changeStatus(application, toStatus, actor, comment) {
  if (application.status === toStatus) return application;
  await pool.query('UPDATE applications SET status = ? WHERE id = ?', [toStatus, application.id]);
  await pool.query(
    `INSERT INTO status_history (application_id, from_status, to_status, changed_by, comment, changed_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [application.id, application.status, toStatus, actor, comment],
  );
  return requireApplication(application.id);
}

async function decide(id, officerUsername, status, comment) {
  const application = await requireApplication(id);
  if (application.status === 'CONFIRMED' || application.status === 'REJECTED') {
    throw httpError(400, 'This application has already been decided');
  }
  const officer = await findOfficer(officerUsername);
  await pool.query(
    'UPDATE applications SET status = ?, notes = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?',
    [status, comment, officer?.full_name || officerUsername, application.id],
  );
  await pool.query(
    `INSERT INTO status_history (application_id, from_status, to_status, changed_by, comment, changed_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [application.id, application.status, status, officerUsername, comment],
  );
  return requireApplication(application.id);
}

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
    app.listen(PORT, () => console.log(`HELSB Node API listening on ${PORT}`));
  })
  .catch((error) => {
    console.error('Could not start. Check MySQL settings in .env.');
    console.error(error.message);
    process.exit(1);
  });
