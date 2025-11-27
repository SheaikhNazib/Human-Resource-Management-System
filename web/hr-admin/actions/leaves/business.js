import { useState, useEffect, useCallback } from "react";
import {
  getLeavesList,
  getLeaveById as getLeaveByIdAction,
  deleteLeave as deleteLeaveAction,
  createLeave as createLeaveAction,
  updateLeave as updateLeaveAction,
  updateLeaveStatus as updateLeaveStatusAction,
} from "./server-actions";

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLeavesList();
      console.debug("useLeaves: getLeavesList response:", response);
      if (response && response.success) {
        setLeaves(Array.isArray(response.data) ? response.data : []);
      } else {
        const errMsg = response && response.error ? response.error : "Unknown error fetching leaves";
        console.debug("useLeaves: getLeavesList error:", errMsg);
        setError(errMsg);
      }
    } catch (err) {
      console.error("useLeaves: exception fetching leaves:", err);
      setError(err?.message || String(err));
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

  const updateLeaveStatus = async (id, status, approvedBy = null) => {
    try {
      const response = await updateLeaveStatusAction(id, status, approvedBy);
      if (response.success) {
        // Update the local state immediately for better UX
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === id
              ? { ...leave, status, approvedBy, approvedAt: new Date().toISOString() }
              : leave
          )
        );
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
    updateLeaveStatus,
  };
};

// Wrapper functions for client-side usage
export async function createLeaveClient(payload) {
  return await createLeaveAction(payload);
}

export async function updateLeaveClient(id, payload) {
  return await updateLeaveAction(id, payload);
}

export async function getLeaveByIdClient(id) {
  return await getLeaveByIdAction(id);
}
