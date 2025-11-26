import { useState, useEffect, useCallback } from 'react';
import { getTaskStatusesList, getTaskStatusById } from './server-actions';

export const useTaskStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTaskStatusesList();
      if (response.success) {
        setStatuses(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, loading, error, refetch: fetchStatuses };
};

export const useTaskStatusById = (id) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTaskStatusByIdClient(id);
        if (!mounted) return;
        
        if (res.success) {
          setStatus(res.data);
        } else {
          setError(res.error || 'Failed to load task status');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  return { status, loading, error };
};

export async function getTaskStatusByIdClient(id) {
  return await getTaskStatusById(id);
}

export async function getTaskStatusesListClient() {
  return await getTaskStatusesList();
}
