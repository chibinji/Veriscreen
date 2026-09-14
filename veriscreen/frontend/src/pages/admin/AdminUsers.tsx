import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import type { User, Role } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { type Column } from '../../components/tables/DataTable';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDate, getRoleLabel } from '../../utils';
import { DEFAULT_PAGE_SIZE } from '../../constants';

const ROLES: Role[] = ['STUDENT', 'HELSB_STUDENT', 'HELSB_OFFICER', 'ADMIN'];

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleModal, setRoleModal] = useState<{ user: User; newRole: Role } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, size: pageSize, search }],
    queryFn: () => adminService.getAllUsers({ page, size: pageSize, search }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setRoleModal(null);
      setSuccess('User role updated successfully.');
    },
    onError: () => setError('Failed to update user role.'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccess('User deactivated.');
    },
    onError: () => setError('Failed to deactivate user.'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccess('User activated.');
    },
    onError: () => setError('Failed to activate user.'),
  });

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'User',
      sortable: true,
      render: (row) => (
        <div>
          <p className="mb-0 small fw-medium">{row.firstName} {row.lastName}</p>
          <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{row.username}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="small">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
          {getRoleLabel(row.role)}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.active === false ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'}`}>
          {row.active === false ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (row) => <span className="small text-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-1">
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              Change Role
            </button>
            <ul className="dropdown-menu shadow border-0">
              {ROLES.map((r) => (
                <li key={r}>
                  <button
                    className={`dropdown-item small ${row.role === r ? 'active' : ''}`}
                    onClick={() => setRoleModal({ user: row, newRole: r })}
                  >
                    {getRoleLabel(r)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {row.active === false ? (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => activateMutation.mutate(row.id)}
              title="Activate"
            >
              <i className="bi bi-person-check" />
            </button>
          ) : (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => deactivateMutation.mutate(row.id)}
              title="Deactivate"
            >
              <i className="bi bi-person-dash" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View and manage all registered users."
        breadcrumbs={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Users' }]}
      />

      {error && <AlertMessage type="danger" message={error} onDismiss={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} autoDismiss={4000} onDismiss={() => setSuccess('')} />}

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
        searchPlaceholder="Search users…"
        emptyTitle="No users found"
        getRowKey={(row) => row.id}
      />

      {roleModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h6 className="modal-title fw-bold">Change Role</h6>
                <button className="btn-close" onClick={() => setRoleModal(null)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-0">
                  Change <strong>{roleModal.user.firstName} {roleModal.user.lastName}</strong>'s role to{' '}
                  <strong>{getRoleLabel(roleModal.newRole)}</strong>?
                </p>
              </div>
              <div className="modal-footer border-top">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setRoleModal(null)}>Cancel</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => roleMutation.mutate({ id: roleModal.user.id, role: roleModal.newRole })}
                  disabled={roleMutation.isPending}
                >
                  {roleMutation.isPending ? <span className="spinner-border spinner-border-sm" /> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
