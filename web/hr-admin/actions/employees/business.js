import { useState, useEffect, useCallback } from 'react';
import { getEmployeesList, deleteEmployee as deleteEmployeeAction } from './server-actions';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmployeesList();
      if (response.success) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
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
    fetchEmployees();
  }, [fetchEmployees]);

  const deleteEmployee = async (id) => {
    try {
      const response = await deleteEmployeeAction(id);
      if (response.success) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { employees, loading, error, refetch: fetchEmployees, deleteEmployee };
};
