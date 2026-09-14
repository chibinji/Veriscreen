import { useState } from 'react';
import { getErrorMessage } from '../utils';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const run = async (fn: () => Promise<T>, successMessage?: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await fn();
      setData(result);
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, success, setError, setSuccess, run };
}
