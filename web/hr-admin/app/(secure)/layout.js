"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

function SecureLayoutContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading, user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

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

  // Role-based route protection
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Define allowed routes for employee role
      const employeeAllowedRoutes = [
        '/employee-dashboard',
      ];

      // Define allowed routes for accountant role
      const accountantAllowedRoutes = [
        '/dashboard',
        '/salary-compensations/salary-list',
        '/salary-compensations/view',
        '/salary-compensations/edit',
        '/salary-compensations/new',
      ];

      // Define allowed routes for hr_manager role
      const hrManagerAllowedRoutes = [
        '/dashboard',
        '/departments',
        '/employees',
        '/attendance',
        '/attendance-records',
        '/leaves',
        '/performance',
        '/tasks',
      ];

      // Define allowed routes for manager role
      const managerAllowedRoutes = [
        '/dashboard',
        '/departments',
        '/employees',
        '/attendance',
        '/attendance-records',
        '/leaves',
        '/performance',
        '/tasks',
      ];

      // Check if user is employee and trying to access unauthorized route
      if (user.role === 'employee') {
        // Special handling for task routes - only allow view pages
        if (pathname.startsWith('/tasks/')) {
          const isTaskViewPage = pathname.match(/^\/tasks\/\d+\/view/);
          if (!isTaskViewPage) {
            console.log('Employee trying to access non-view task page, redirecting');
            router.push('/employee-dashboard');
            return;
          }
        } else {
          // Check normal allowed routes
          const isAllowedRoute = employeeAllowedRoutes.some((route) =>
            pathname.startsWith(route)
          );

          if (!isAllowedRoute) {
            console.log('Employee accessing unauthorized route, redirecting to employee dashboard');
            router.push('/employee-dashboard');
          }
        }
      }

      // Check if user is accountant and trying to access unauthorized route
      if (user.role === 'accountant') {
        const isAllowedRoute = accountantAllowedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (!isAllowedRoute) {
          console.log('Accountant accessing unauthorized route, redirecting to dashboard');
          router.push('/dashboard');
        }
      }

      // Check if user is hr_manager and trying to access unauthorized route
      if (user.role === 'hr_manager') {
        const isAllowedRoute = hrManagerAllowedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (!isAllowedRoute) {
          console.log('HR Manager accessing unauthorized route, redirecting to dashboard');
          router.push('/dashboard');
        }
      }

      // Check if user is manager and trying to access unauthorized route
      if (user.role === 'manager') {
        const isAllowedRoute = managerAllowedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (!isAllowedRoute) {
          console.log('Manager accessing unauthorized route, redirecting to dashboard');
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, loading, user, pathname, router]);

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

  // Check if user is an employee - they get a different layout without sidebar
  const isEmployee = user?.role === 'employee';

  if (isEmployee) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Header only - no sidebar toggle for employees */}
        <Header onOpen={null} />
        {/* Content Area - full width without sidebar */}
        <main className="flex-1 p-4 lg:p-8 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto">
          {children}
        </main>
      </div>
    );
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
