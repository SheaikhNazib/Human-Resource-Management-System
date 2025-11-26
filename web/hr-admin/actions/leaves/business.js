import { useState, useEffect, useCallback } from "react";
import {
  getLeavesList,
  deleteLeave as deleteLeaveAction,
  createLeave as createLeaveAction,
  updateLeave as updateLeaveAction,
} from "./server-actions";

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLeavesList();
      if (response.success) {
        setLeaves(Array.isArray(response.data) ? response.data : []);
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
    fetchLeaves();
  }, [fetchLeaves]);

  const deleteLeave = async (id) => {
    try {
      const response = await deleteLeaveAction(id);
      if (response.success) {
        setLeaves((prev) => prev.filter((leave) => leave.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createLeave = async (data) => {
    try {
      const response = await createLeaveAction(data);
      if (response.success) {
        await fetchLeaves(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateLeave = async (id, data) => {
    try {
      const response = await updateLeaveAction(id, data);
      if (response.success) {
        await fetchLeaves(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    leaves,
    loading,
    error,
    refetch: fetchLeaves,
    deleteLeave,
    createLeave,
    updateLeave,
  };
};
