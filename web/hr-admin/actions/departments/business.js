import { useState, useEffect, useCallback } from "react";
import {
  getDepartmentsList,
  deleteDepartment as deleteDepartmentAction,
  createDepartment as createDepartmentAction,
  updateDepartment as updateDepartmentAction,
} from "./server-actions";

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDepartmentsList();
      if (response.success) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
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
    fetchDepartments();
  }, [fetchDepartments]);

  const deleteDept = async (id) => {
    try {
      const response = await deleteDepartmentAction(id);
      if (response.success) {
        setDepartments((prev) =>
          prev.filter((d) => String(d.id) !== String(id))
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createDept = async (data) => {
    try {
      const response = await createDepartmentAction(data);
      if (response.success) {
        await fetchDepartments(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateDept = async (id, data) => {
    try {
      const response = await updateDepartmentAction(id, data);
      if (response.success) {
        await fetchDepartments(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    deleteDepartment: deleteDept,
    createDepartment: createDept,
    updateDepartment: updateDept,
  };
};
