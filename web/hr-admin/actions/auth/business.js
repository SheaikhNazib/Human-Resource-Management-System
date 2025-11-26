import { useState, useEffect, useCallback } from "react";
import {
  loginUser as loginUserAction,
  logoutUser as logoutUserAction,
  getCurrentUser,
  verifyAuth,
} from "./server-actions";

/**
 * Hook for authentication operations
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await verifyAuth();
      if (response.success && response.authenticated) {
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUserAction(credentials);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
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
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await logoutUserAction();
      if (response.success) {
        setIsAuthenticated(false);
        setUser(null);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    checkAuth,
  };
};
