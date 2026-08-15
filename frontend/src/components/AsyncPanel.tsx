import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { ApiError } from '../types';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

interface AsyncPanelProps<T> {
  title: string;
  description?: string;
  load: () => Promise<T>;
  render: (data: T) => ReactNode;
  emptyMessage?: string;
}

export default function AsyncPanel<T>({
  title,
  description,
  load,
  render,
  emptyMessage = 'No records found.',
}: AsyncPanelProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await load();
        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          const apiError = err as ApiError;
          setError(apiError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>

      {loading ? <LoadingState /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && data == null ? <p className="empty-state">{emptyMessage}</p> : null}
      {!loading && !error && data != null ? render(data) : null}
    </section>
  );
}
