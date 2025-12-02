"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getCurrentUser, verifyAuth } from "@/actions/auth";
import { getEmployeeById } from "@/actions/employees/server-actions";

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

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = async () => {
      console.log("Token expired event received");
      setIsAuthenticated(false);
      setUser(null);
      
      // Force clear all state and redirect
      if (typeof window !== 'undefined') {
        // Use window.location for immediate redirect
        window.location.href = '/login';
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('token-expired', handleTokenExpired);
      return () => {
        window.removeEventListener('token-expired', handleTokenExpired);
      };
    }
  }, []);

  // Periodic token validation - check more frequently
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await verifyAuth();
        if (!response.success || !response.authenticated) {
          // Token is no longer valid
          console.log("Token validation failed, logging out");
          setIsAuthenticated(false);
          setUser(null);
          
          // Force page redirect
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // On error, also log out
        setIsAuthenticated(false);
        setUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await verifyAuth();
      if (response.success && response.authenticated) {
        setIsAuthenticated(true);
        // Normalize user object — if it's an employee without email, fetch full employee
        try {
          let authUser = response.user || {};
          if (
            authUser.role === "employee" &&
            !authUser.email &&
            (authUser.personal_email === undefined || authUser.work_email === undefined) &&
            authUser.id
          ) {
            const empResp = await getEmployeeById(authUser.id);
            if (empResp.success && empResp.data) {
              // Merge employee fields so header can show emails and names
              authUser = { ...authUser, ...empResp.data };
            }
          }
          setUser(authUser);
        } catch (err) {
          console.error("Failed to fetch employee details during auth check:", err);
          setUser(response.user);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login if not authenticated
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && !window.location.pathname.startsWith('/register')) {
          router.push("/login");
        }
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
        // After login, normalize user — if logged in as employee, fetch full employee
        try {
          let authUser = response.data.user || {};
          if (
            authUser.role === "employee" &&
            !authUser.email &&
            authUser.id
          ) {
            const empResp = await getEmployeeById(authUser.id);
            if (empResp.success && empResp.data) {
              authUser = { ...authUser, ...empResp.data };
            }
          }
          setUser(authUser);
        } catch (err) {
          console.error("Failed to fetch employee details after login:", err);
          setUser(response.data.user);
        }
        
        // Redirect based on role
        const userRole = response.data.user?.role;
        if (userRole === 'employee') {
          router.push("/employee-dashboard");
        } else {
          router.push("/dashboard");
        }
        
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
      
      // Call frontend API route to clear cookies server-side
      try {
        const resp = await fetch('/api/auth/logout', { method: 'POST' });
        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}));
          console.error('Logout API returned error:', resp.status, errBody);
        }
      } catch (err) {
        console.error('Failed to call /api/auth/logout:', err);
      }
      
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
        // If the returned user is an employee missing email fields, fetch employee record
        try {
          let authUser = response.data || {};
          if (
            authUser.role === "employee" &&
            !authUser.email &&
            authUser.id
          ) {
            const empResp = await getEmployeeById(authUser.id);
            if (empResp.success && empResp.data) {
              authUser = { ...authUser, ...empResp.data };
            }
          }
          setUser(authUser);
        } catch (err) {
          console.error("Failed to fetch employee details during refresh:", err);
          setUser(response.data);
        }
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
