import { useState, useEffect, useCallback } from "react";
import {
  getJobTitlesList,
  deleteJobTitle as deleteJobTitleAction,
  createJobTitle as createJobTitleAction,
  updateJobTitle as updateJobTitleAction,
} from "./server-actions";

export const useJobTitles = () => {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobTitles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getJobTitlesList();
      if (response.success) {
        setJobTitles(Array.isArray(response.data) ? response.data : []);
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
    fetchJobTitles();
  }, [fetchJobTitles]);

  const deleteJobTitleById = async (id) => {
    try {
      const response = await deleteJobTitleAction(id);
      if (response.success) {
        setJobTitles((prev) =>
          prev.filter((j) => String(j.id) !== String(id))
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createJobTitleItem = async (data) => {
    try {
      const response = await createJobTitleAction(data);
      if (response.success) {
        await fetchJobTitles();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateJobTitleItem = async (id, data) => {
    try {
      const response = await updateJobTitleAction(id, data);
      if (response.success) {
        await fetchJobTitles();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    jobTitles,
    loading,
    error,
    fetchJobTitles,
    deleteJobTitleById,
    createJobTitleItem,
    updateJobTitleItem,
  };
};
