import { useState, useEffect, useCallback } from 'react';
import { getAttendancesList, deleteAttendance as deleteAttendanceAction } from './server-actions';

export const useAttendances = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAttendancesList();
      if (response.success) {
        setAttendances(Array.isArray(response.data) ? response.data : []);
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
    fetchAttendances();
  }, [fetchAttendances]);

  const deleteAttendance = async (id) => {
    try {
      const response = await deleteAttendanceAction(id);
      if (response.success) {
        setAttendances((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { attendances, loading, error, refetch: fetchAttendances, deleteAttendance };
};
