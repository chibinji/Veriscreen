import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import type { AuditLog } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { type Column } from '../../components/tables/DataTable';
import { formatDateTime } from '../../utils';
import { DEFAULT_PAGE_SIZE } from '../../constants';

const AdminAuditLogs: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, size: pageSize, search }],
    queryFn: () => adminService.getAuditLogs({ page, size: pageSize, search }),
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => <span className="small text-muted">{formatDateTime(row.timestamp)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{row.action}</span>
      ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      render: (row) => <span className="small fw-medium">{row.performedBy}</span>,
    },
    {
      key: 'targetEntity',
      header: 'Entity',
      render: (row) => (
        <div>
          <span className="small fw-medium">{row.targetEntity}</span>
          <span className="text-muted small ms-1">#{row.targetId}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (row) => <span className="small text-muted">{row.details}</span>,
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (row) => <code className="small">{row.ipAddress}</code>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Monitor all system activity and user actions."
        breadcrumbs={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Audit Logs' }]}
      />

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
        searchPlaceholder="Search by action, user, or entity…"
        emptyTitle="No audit logs"
        emptyDescription="System activity will appear here."
        emptyIcon="bi-journal"
        getRowKey={(row) => row.id}
      />
    </div>
  );
};

export default AdminAuditLogs;
