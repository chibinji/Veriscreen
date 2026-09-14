import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { helsbService } from '../../services/helsbService';
import type { Application } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils';

const OfficerSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const data = await helsbService.searchStudents(query.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Search Students"
        subtitle="Search for students by name, student number, or NRC."
        breadcrumbs={[{ label: 'Dashboard', path: '/officer/dashboard' }, { label: 'Search Students' }]}
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <span className="input-group-text bg-primary text-white border-primary">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control form-control-lg"
                placeholder="Enter student name, number, or NRC…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading || !query.trim()}
              >
                {loading
                  ? <span className="spinner-border spinner-border-sm" />
                  : 'Search'
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2" />{error}
        </div>
      )}

      {searched && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom fw-semibold py-3">
            <i className="bi bi-list-ul me-2 text-primary" />
            Search Results
            <span className="badge bg-primary-subtle text-primary ms-2">{results.length} found</span>
          </div>
          <div className="card-body p-0">
            {results.length === 0 ? (
              <EmptyState
                icon="bi-search"
                title="No results found"
                description={`No students matched "${query}". Try a different search term.`}
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Application #</th>
                      <th>Program</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div>
                            <p className="mb-0 small fw-medium">{app.studentName}</p>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{app.studentNumber}</p>
                          </div>
                        </td>
                        <td><code className="small">{app.applicationNumber}</code></td>
                        <td><span className="small">{app.program}</span></td>
                        <td><span className="small text-muted">{formatDateTime(app.submittedAt)}</span></td>
                        <td><StatusBadge status={app.status} /></td>
                        <td>
                          <Link to={`/officer/applications/${app.id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye me-1" />View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerSearch;
