import { useState, useEffect, useCallback } from "react";
import {
  getPerformanceList,
  deletePerformance as deletePerformanceAction,
  createPerformance as createPerformanceAction,
  updatePerformance as updatePerformanceAction,
} from "./server-actions";

export const usePerformance = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPerformanceList();
      if (response.success) {
        setPerformances(Array.isArray(response.data) ? response.data : []);
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
    fetchPerformances();
  }, [fetchPerformances]);

  const deletePerformance = async (id) => {
    try {
      const response = await deletePerformanceAction(id);
      if (response.success) {
        setPerformances((prev) =>
          prev.filter((p) => String(p.id) !== String(id))
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createPerformance = async (data) => {
    try {
      const response = await createPerformanceAction(data);
      if (response.success) {
        await fetchPerformances(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updatePerformance = async (id, data) => {
    try {
      const response = await updatePerformanceAction(id, data);
      if (response.success) {
        await fetchPerformances(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    performances,
    loading,
    error,
    refetch: fetchPerformances,
    deletePerformance,
    createPerformance,
    updatePerformance,
  };
};
