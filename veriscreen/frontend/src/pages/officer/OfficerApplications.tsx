import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import type { Application } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { type Column } from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils';
import { DEFAULT_PAGE_SIZE } from '../../constants';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Contract Generated', value: 'CONTRACT_GENERATED' },
];

const OfficerApplications: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['applications', { page, size: pageSize, search, status: statusFilter, sort: sortKey, direction: sortDir }],
    queryFn: () => helsbService.getAllApplications({ page, size: pageSize, search, sort: sortKey, direction: sortDir, status: statusFilter || undefined }),
  });

  const columns: Column<Application>[] = [
    {
      key: 'applicationNumber',
      header: 'Application #',
      sortable: true,
      render: (row) => <code className="small">{row.applicationNumber}</code>,
    },
    {
      key: 'studentName',
      header: 'Student',
      sortable: true,
      render: (row) => (
        <div>
          <p className="mb-0 small fw-medium">{row.studentName}</p>
          <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{row.studentNumber}</p>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      render: (row) => <span className="small">{row.program}</span>,
    },
    {
      key: 'faculty',
      header: 'Faculty',
      render: (row) => <span className="small text-muted">{row.faculty}</span>,
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      sortable: true,
      render: (row) => <span className="small text-muted">{formatDateTime(row.submittedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Link to={`/officer/applications/${row.id}`} className="btn btn-sm btn-outline-primary">
          <i className="bi bi-eye me-1" />Review
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Review and manage all HELSB student applications."
        breadcrumbs={[{ label: 'Dashboard', path: '/officer/dashboard' }, { label: 'Applications' }]}
      />

      <div className="mb-3 d-flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setStatusFilter(f.value); setPage(0); }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        totalElements={data?.totalElements ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        onSearch={(q) => { setSearch(q); setPage(0); }}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchPlaceholder="Search by name or student number…"
        emptyTitle="No applications found"
        emptyDescription="No applications match your current filters."
        getRowKey={(row) => row.id}
      />
    </div>
  );
};

export default OfficerApplications;
