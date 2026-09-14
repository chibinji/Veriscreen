import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  canVerifyDocument,
  clearToken,
  DOCUMENT_VERIFY_BASE,
  documentLabel,
  hasToken,
  helsbApi,
  saveToken,
  type Application,
  type HistoryItem,
  type ProgrammeCount,
  type School,
  type University,
} from './api';

function statusClass(status: string) {
  if (status === 'CONFIRMED') return 'badge-confirmed';
  if (status === 'REJECTED') return 'badge-rejected';
  if (status === 'UNDER_REVIEW') return 'badge-review';
  return 'badge-pending';
}

function percentClass(percent?: number) {
  if (percent === 100) return 'loan-100';
  if (percent === 75) return 'loan-75';
  return 'loan-50';
}

function bachelorProgramme(name?: string) {
  const value = (name || '').trim();
  if (!value) return '';
  if (/^bachelor of\b/i.test(value)) return value;
  return `Bachelor of ${value}`;
}

function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState('mwaka.chanda@helsb.zm');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await helsbApi.login(id.trim().toLowerCase(), password);
      saveSession(result.accessToken, result.fullName);
      navigate('/');
    } catch {
      setError('Invalid officer credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <img src="/helsb-logo.png" alt="HELSB logo" className="login-logo" />
        <h1>HELSB</h1>
        <p className="login-subtitle">Higher Education Loans and Scholarship Board</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <label className="form-label fw-semibold">Officer email</label>
        <input
          className="form-control mb-3"
          type="email"
          autoComplete="username"
          placeholder="officername@helsb.zm"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <label className="form-label fw-semibold">Password</label>
        <input
          className="form-control mb-4"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-helsb w-100" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function saveSession(token: string, name: string) {
  saveToken(token);
  localStorage.setItem('helsb_officer_name', name);
}

function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const name = localStorage.getItem('helsb_officer_name') || 'Officer';
  return (
    <div className="portal-body">
      <nav className="helsb-topbar px-4 py-3 d-flex justify-content-between align-items-center">
        <Link to="/" className="brand-link">
          <img src="/helsb-logo.png" alt="" className="nav-logo" />
          <span>
            <strong>HELSB</strong>
            <small>Officer Portal</small>
          </span>
        </Link>
        <div className="d-flex align-items-center gap-3">
          <span className="officer-name">{name}</span>
          <button
            className="btn btn-sm btn-outline-light rounded-pill"
            onClick={() => {
              clearToken();
              navigate('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </nav>
      <div className="container py-4">{children}</div>
    </div>
  );
}

function Dashboard() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    helsbApi.universities()
      .then(setUniversities)
      .catch(() => setError('Unable to load universities. Is the HELSB backend running on port 8083?'));
  }, []);

  return (
    <>
      <h2 className="page-title">Universities</h2>
      <p className="page-lead">Select an institution to view schools, applications, and screening.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {universities.map((university) => (
          <div className="col-md-6 col-xl-4" key={university.code}>
            <Link to={`/universities/${university.code}`} className="uni-card">
              <div className="uni-abbr">{university.abbreviation}</div>
              <h3>{university.name}</h3>
              <p>{university.schoolCount} schools</p>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

function UniversitySchools() {
  const { uniCode } = useParams();
  const [data, setData] = useState<{ university: University; schools: School[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniCode) return;
    helsbApi.university(uniCode)
      .then(setData)
      .catch(() => setError('Unable to load this university.'));
  }, [uniCode]);

  if (!data) return <p>{error || 'Loading…'}</p>;

  return (
    <>
      <Link to="/" className="back-link">← Universities</Link>
      <h2 className="page-title mt-2">{data.university.name}</h2>
      <p className="page-lead">Schools at {data.university.abbreviation}</p>
      <div className="row g-3">
        {data.schools.map((school) => (
          <div className="col-lg-6" key={school.code}>
            <div className="school-card">
              <h3>{school.name}</h3>
              <p className="mb-3 text-muted">
                {school.applicationCount} applications · {school.newApplicationCount} new
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-outline-helsb" to={`/universities/${uniCode}/schools/${school.code}/applications`}>
                  View applications
                </Link>
                <Link className="btn btn-helsb" to={`/universities/${uniCode}/schools/${school.code}/screening`}>
                  Screening
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SchoolApplications() {
  const { uniCode, schoolCode } = useParams();
  const [total, setTotal] = useState(0);
  const [apps, setApps] = useState<Application[]>([]);
  const [university, setUniversity] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniCode || !schoolCode) return;
    helsbApi.schoolApplications(uniCode, schoolCode)
      .then((data) => {
        setTotal(data.totalApplications);
        setApps(data.newApplications);
        setUniversity(data.university.name);
        setSchool(data.school.name);
      })
      .catch(() => setError('Unable to load applications.'));
  }, [uniCode, schoolCode]);

  return (
    <>
      <Link to={`/universities/${uniCode}`} className="back-link">← {university || 'Schools'}</Link>
      <h2 className="page-title mt-2">View applications</h2>
      <p className="page-lead">{school}</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="stat-banner mb-4">
        Total applications: <strong>{total}</strong>
      </div>
      <h5 className="mb-3">New applications</h5>
      <div className="card shadow-sm p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Application</th>
                <th>Student</th>
                <th>Programme</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>{app.applicationNumber}</td>
                  <td>
                    {app.studentName}
                    <div className="small text-muted">{app.studentId}</div>
                  </td>
                  <td>{app.programme || '—'}</td>
                  <td>{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—'}</td>
                  <td>
                    <Link to={`/universities/${uniCode}/schools/${schoolCode}/applications/${app.id}`}>Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {apps.length === 0 && <p className="text-muted px-2 mb-0">No new applications in this school.</p>}
        </div>
      </div>
    </>
  );
}

function SchoolScreening() {
  const { uniCode, schoolCode } = useParams();
  const [programmes, setProgrammes] = useState<ProgrammeCount[]>([]);
  const [university, setUniversity] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniCode || !schoolCode) return;
    helsbApi.schoolProgrammes(uniCode, schoolCode)
      .then((data) => {
        setProgrammes(data.programmes);
        setUniversity(data.university.name);
        setSchool(data.school.name);
      })
      .catch(() => setError('Unable to load programmes.'));
  }, [uniCode, schoolCode]);

  return (
    <>
      <Link to={`/universities/${uniCode}`} className="back-link">← {university || 'Schools'}</Link>
      <h2 className="page-title mt-2">Screening</h2>
      <p className="page-lead">{school} · programmes with student loans</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="list-group shadow-sm rounded-4 overflow-hidden">
        {programmes.map((programme) => (
          <Link
            key={programme.code}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
            to={`/universities/${uniCode}/schools/${schoolCode}/screening/${programme.code}`}
          >
            <span className="fw-semibold">{bachelorProgramme(programme.name)}</span>
            <span className="loan-count">({programme.loanStudentCount})</span>
          </Link>
        ))}
        {programmes.length === 0 && <div className="p-3 text-muted">No programmes listed for this school.</div>}
      </div>
    </>
  );
}

function ProgrammeScreening() {
  const { uniCode, schoolCode, programmeCode, id } = useParams();
  const [students, setStudents] = useState<Application[]>([]);
  const [programmeName, setProgrammeName] = useState(programmeCode || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniCode || !schoolCode || !programmeCode) return;
    Promise.all([
      helsbApi.schoolProgrammes(uniCode, schoolCode),
      helsbApi.programmeStudents(uniCode, schoolCode, programmeCode),
    ])
      .then(([meta, list]) => {
        const match = meta.programmes.find((item) => item.code === programmeCode);
        setProgrammeName(match?.name || programmeCode);
        setStudents(list);
      })
      .catch(() => setError('Unable to load screening records.'));
  }, [uniCode, schoolCode, programmeCode]);

  const selected = useMemo(
    () => students.find((item) => String(item.id) === id) || null,
    [students, id],
  );

  return (
    <>
      <Link to={`/universities/${uniCode}/schools/${schoolCode}/screening`} className="back-link">← Programmes</Link>
      <h2 className="page-title mt-2">Screening</h2>
      <p className="page-lead">{bachelorProgramme(programmeName)}</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            {students.map((student) => (
              <Link
                key={student.id}
                to={`/universities/${uniCode}/schools/${schoolCode}/screening/${programmeCode}/${student.id}`}
                className={`student-row ${selected?.id === student.id ? 'active' : ''}`}
              >
                <div className="fw-semibold">{student.studentName}</div>
                <div className="small text-muted">{student.studentId}</div>
                <span className={`loan-pill ${percentClass(student.screeningPercent)}`}>
                  {student.screeningPercent ?? 50}%
                </span>
              </Link>
            ))}
            {students.length === 0 && <p className="text-muted p-3 mb-0">No students with a loan on this programme.</p>}
          </div>
        </div>
        <div className="col-lg-8">
          {id ? (
            <ScreeningDetail
              applicationId={id}
              startReview
              backLabel=""
              onUpdated={(updated) => {
                setStudents((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
              }}
            />
          ) : (
            <div className="card shadow-sm p-4 text-muted">Select a student to view details, documents, and approve screening.</div>
          )}
        </div>
      </div>
    </>
  );
}

function ScreeningDetail({
  applicationId,
  startReview,
  onUpdated,
}: {
  applicationId: string;
  startReview?: boolean;
  backLabel?: string;
  onUpdated?: (application: Application) => void;
}) {
  const [data, setData] = useState<{ application: Application; history: HistoryItem[] } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewer, setViewer] = useState<string | null>(null);

  const load = async () => {
    const result = await helsbApi.get(applicationId, Boolean(startReview));
    setData(result);
    onUpdated?.(result.application);
  };

  useEffect(() => {
    setMessage('');
    setError('');
    load().catch(() => setError('Unable to load this application.'));
  }, [applicationId]);

  if (!data) return <p>{error || 'Loading…'}</p>;
  const app = data.application;
  const decided = app.status === 'CONFIRMED' || app.status === 'REJECTED' || Boolean(app.screeningApproved);

  const approve = async () => {
    setError('');
    try {
      const updated = await helsbApi.approveScreening(app.id);
      setMessage('Screening request approved.');
      await load();
      onUpdated?.(updated);
    } catch {
      setError('The screening request could not be approved.');
    }
  };

  return (
    <div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 className="h4 fw-bold mb-1">{app.studentName}</h3>
          <span className={`pill ${statusClass(app.status)}`}>{app.status.replace('_', ' ')}</span>
        </div>
        <span className={`loan-pill ${percentClass(app.screeningPercent)}`}>{app.screeningPercent ?? 50}%</span>
      </div>
      <div className="card shadow-sm p-4 mb-3">
        <h5>Student details</h5>
        {[
          ['Application', app.applicationNumber],
          ['Student ID', app.studentId],
          ['NRC', app.nrc],
          ['Programme', bachelorProgramme(app.programme)],
          ['School', app.schoolName || app.faculty],
          ['Loan status', `${app.screeningPercent ?? 50}%`],
          ['Screening', app.screeningApproved ? 'Approved' : 'Awaiting approval'],
          ['Submitted', app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—'],
        ].map(([label, value]) => (
          <div key={label} className="d-flex justify-content-between border-bottom py-2 gap-3">
            <span className="text-muted">{label}</span>
            <span className="fw-semibold text-end">{value || '—'}</span>
          </div>
        ))}
      </div>
      <div className="card shadow-sm p-4 mb-3">
        <h5>Submitted documents</h5>
        {app.documentIds?.length ? (
          <div className="d-flex flex-column gap-2">
            {app.documentIds.map((doc) => (
              <div key={doc} className="document-row">
                <div>
                  <div className="fw-semibold">{documentLabel(doc)}</div>
                  <div className="small text-muted">{doc}</div>
                </div>
                <button className="btn btn-sm btn-outline-helsb" type="button" onClick={() => setViewer(doc)}>
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted mb-0">No documents attached.</p>
        )}
      </div>
      <div className="card shadow-sm p-4 mb-3">
        <h5>Approve screening</h5>
        <button className="btn btn-helsb mt-2" disabled={decided} onClick={approve}>
          {app.screeningApproved ? 'Screening approved' : 'Approve screening request'}
        </button>
      </div>
      <div className="card shadow-sm p-4">
        <h5>History</h5>
        {data.history.map((item) => (
          <div key={item.id} className="border-bottom py-2">
            <div className="fw-semibold">{item.fromStatus || '—'} → {item.toStatus}</div>
            <div className="small text-muted">{item.changedBy} · {item.changedAt ? new Date(item.changedAt).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
      {viewer && (
        <DocumentViewer
          documentId={viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}

function DocumentViewer({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const verifyUrl = `${DOCUMENT_VERIFY_BASE}/${encodeURIComponent(documentId)}`;
  return (
    <div className="doc-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={(event) => event.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{documentLabel(documentId)}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
        </div>
        <p className="text-muted">{documentId}</p>
        {canVerifyDocument(documentId) ? (
          <>
            <iframe title={documentId} className="doc-frame" src={verifyUrl} />
            <a className="btn btn-helsb mt-3" href={verifyUrl} target="_blank" rel="noreferrer">Open verification</a>
          </>
        ) : (
          <div className="doc-placeholder">
            <p className="mb-1 fw-semibold">{documentLabel(documentId)}</p>
            <p className="mb-0">This file was submitted with the loan application and is available for officer review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationDetailPage() {
  const { uniCode, schoolCode, id } = useParams();
  if (!id) return null;
  return (
    <>
      <Link to={`/universities/${uniCode}/schools/${schoolCode}/applications`} className="back-link">← New applications</Link>
      <h2 className="page-title mt-2">Application details</h2>
      <div className="mt-3">
        <ScreeningDetail applicationId={id} />
      </div>
    </>
  );
}

function Guard({ children }: { children: React.ReactNode }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/universities/:uniCode" element={<Guard><UniversitySchools /></Guard>} />
      <Route path="/universities/:uniCode/schools/:schoolCode/applications" element={<Guard><SchoolApplications /></Guard>} />
      <Route path="/universities/:uniCode/schools/:schoolCode/applications/:id" element={<Guard><ApplicationDetailPage /></Guard>} />
      <Route path="/universities/:uniCode/schools/:schoolCode/screening" element={<Guard><SchoolScreening /></Guard>} />
      <Route path="/universities/:uniCode/schools/:schoolCode/screening/:programmeCode" element={<Guard><ProgrammeScreening /></Guard>} />
      <Route path="/universities/:uniCode/schools/:schoolCode/screening/:programmeCode/:id" element={<Guard><ProgrammeScreening /></Guard>} />
    </Routes>
  );
}
