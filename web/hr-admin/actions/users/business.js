import { useState, useCallback } from "react";
import {
  getUsersList as getUsersListAction,
  getUserById as getUserByIdAction,
  createUser as createUserAction,
  updateUser as updateUserAction,
  deleteUser as deleteUserAction,
} from "./server-actions";

/**
 * Hook for user management operations
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersListAction();
      if (response.success) {
        setUsers(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserByIdAction(id);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createUserAction(userData);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUserAction(id, userData);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteUserAction(id);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, message: response.message };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
