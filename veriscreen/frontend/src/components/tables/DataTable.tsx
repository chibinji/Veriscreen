import { useState, useMemo, type ReactNode } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants';
import { debounce } from '../../utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalElements?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  actions?: ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
}

function DataTable<T>({
  columns, data, loading, totalElements = 0,
  page = 0, pageSize = DEFAULT_PAGE_SIZE,
  onPageChange, onPageSizeChange, onSearch, onSort,
  searchPlaceholder = 'Search…',
  emptyTitle = 'No records found',
  emptyDescription,
  emptyIcon = 'bi-table',
  actions,
  getRowKey,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch?.(q), 350),
    [onSearch]
  );

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const totalPages = Math.ceil(totalElements / pageSize);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="card border-0 shadow-sm">
      {/* Toolbar */}
      {(onSearch || actions) && (
        <div className="card-header bg-white border-bottom d-flex flex-wrap gap-2 align-items-center justify-content-between py-3">
          {onSearch && (
            <div className="input-group" style={{ maxWidth: 320 }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="search"
                className="form-control border-start-0 bg-light"
                placeholder={searchPlaceholder}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
          )}
          {actions && <div className="d-flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.sortable ? 'cursor-pointer user-select-none' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="d-flex align-items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-muted">
                        {sortKey === col.key ? (
                          <i className={`bi bi-sort-${sortDir === 'asc' ? 'up' : 'down'}-alt`} />
                        ) : (
                          <i className="bi bi-arrow-down-up opacity-50" style={{ fontSize: '0.7rem' }} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <LoadingSpinner text="Loading data…" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={getRowKey ? getRowKey(row, idx) : idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row, idx)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 0 && (
        <div className="card-footer bg-white border-top d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Rows per page:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 80 }}
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="text-muted small">
            {totalElements > 0 ? `${startItem}–${endItem} of ${totalElements}` : '0 results'}
          </span>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(0)}>&laquo;</button>
              </li>
              <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(page - 1)}>&lsaquo;</button>
              </li>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i;
                if (totalPages > 5 && page > 2) {
                  p = Math.min(page - 2 + i, totalPages - 1);
                }
                return (
                  <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(p)}>{p + 1}</button>
                  </li>
                );
              })}

              <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(page + 1)}>&rsaquo;</button>
              </li>
              <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(totalPages - 1)}>&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default DataTable;
