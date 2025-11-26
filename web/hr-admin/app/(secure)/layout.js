"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

function SecureLayoutContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      // Use window.location for immediate redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header onOpen={() => setSidebarOpen(true)} />
        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SecureLayout({ children }) {
  return (
    <AuthProvider>
      <SecureLayoutContent>{children}</SecureLayoutContent>
    </AuthProvider>
  );
}
