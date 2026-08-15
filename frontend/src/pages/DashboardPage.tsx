import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAcademicResults,
  fetchDocuments,
  fetchExaminations,
  fetchFees,
  fetchHelsbApplications,
  fetchRegistrations,
} from '../api/student';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../types';

interface DashboardStats {
  registrations: number;
  fees: number;
  examinations: number;
  results: number;
  helsb: number;
  documents: number;
  outstandingBalance: number;
}

const quickLinks = [
  { to: '/documents', title: 'Documents', copy: 'View confirmation slips and academic summaries' },
  { to: '/fees', title: 'Fee history', copy: 'Check payments and outstanding balances' },
  { to: '/examinations', title: 'Examinations', copy: 'See exam eligibility and status' },
  { to: '/helsb', title: 'HELSB', copy: 'Track loan application and screening status' },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const [registrations, fees, examinations, results, helsb, documents] = await Promise.all([
        fetchRegistrations(),
        fetchFees(),
        fetchExaminations(),
        fetchAcademicResults(),
        fetchHelsbApplications(),
        fetchDocuments(),
      ]);

      const outstandingBalance = fees.reduce(
        (total, fee) => total + Number(fee.outstandingBalance ?? 0),
        0,
      );

      setStats({
        registrations: registrations.length,
        fees: fees.length,
        examinations: examinations.length,
        results: results.length,
        helsb: helsb.length,
        documents: documents.length,
        outstandingBalance,
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="page">
      <PageHeader
        title={`Welcome, ${profile?.name?.split(' ')[0] ?? 'Student'}`}
        description="Review your verified academic records and screening status in one place."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Registrations</span>
          <strong>{stats?.registrations ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span>Fee records</span>
          <strong>{stats?.fees ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span>Exam records</span>
          <strong>{stats?.examinations ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span>Course results</span>
          <strong>{stats?.results ?? '—'}</strong>
        </article>
        <article className="stat-card">
          <span>HELSB applications</span>
          <strong>{stats?.helsb ?? '—'}</strong>
        </article>
        <article className="stat-card accent">
          <span>Outstanding balance</span>
          <strong>
            {stats ? `K ${stats.outstandingBalance.toLocaleString()}` : '—'}
          </strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Quick access</h2>
          <p>Jump to the records you need for screening and verification.</p>
        </div>
        <div className="link-grid">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="link-card">
              <h3>{link.title}</h3>
              <p>{link.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel muted">
        <div className="panel-header">
          <h2>Available documents</h2>
          <p>{stats?.documents ?? 0} document summaries ready from your verified records.</p>
        </div>
        <Link to="/documents" className="btn btn-primary inline">
          View documents
        </Link>
      </section>
    </div>
  );
}
