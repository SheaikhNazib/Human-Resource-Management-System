"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyAuth,
} from "@/actions/auth";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Clear local state immediately
      setIsAuthenticated(false);
      setUser(null);
      
      // Call server action to clear cookies
      await logoutUser();
      
      // Force navigation to login page
      router.push("/login");
      
      // Force a full page refresh to clear any cached data
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if server logout fails, still clear local state and redirect
      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
      return { success: false, error: error.message };
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
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
