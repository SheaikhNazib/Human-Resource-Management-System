import { useState, useEffect, useCallback } from 'react';
import { getSalaryCompensationsList, deleteSalaryCompensation as deleteSalaryCompensationAction } from './server-actions';

export const useSalaryCompensations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSalaryCompensationsList();
      if (response.success) {
        setItems(Array.isArray(response.data) ? response.data : []);
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
    fetchItems();
  }, [fetchItems]);

  const deleteSalaryCompensation = async (id) => {
    try {
      const response = await deleteSalaryCompensationAction(id);
      if (response.success) {
        setItems((prev) => prev.filter((e) => e.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { items, loading, error, refetch: fetchItems, deleteSalaryCompensation };
};
