"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEmployeeById } from "@/actions/employees/server-actions";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  AlertCircle,
  User,
  Briefcase,
  Calendar,
  Edit,
  Clock,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";
import TabBar from "@/components/employee/TabBar";
import AboutPanel from "@/components/employee/AboutPanel";
import TasksPanel from "@/components/employee/TasksPanel";
import LeavesPanel from "@/components/employee/LeavesPanel";
import AttendancePanel from "@/components/employee/AttendancePanel";

const TABS = [
  { id: "about", label: "About", icon: User },
  { id: "tasks", label: "My Tasks", icon: Briefcase },
  { id: "leaves", label: "Leaves", icon: Calendar },
  { id: "attendance", label: "Attendance", icon: Clock },
];

const EmployeeDashboardPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [visitedTabs, setVisitedTabs] = useState(new Set(["about"]));

  useEffect(() => {
    const fetchEmployee = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // Check if user is an employee
      if (!user || user.role !== "employee") {
        toast.error("Access denied. This page is only for employees.");
        router.push("/dashboard");
        return;
      }

      // Get employee ID from user
      const employeeId = user.id;
      if (!employeeId) {
        setError("Employee ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getEmployeeById(employeeId);

        if (response.success) {
          setEmployee(response.data);
        } else {
          setError(response.error || "Failed to fetch employee details");
          toast.error(response.error || "Failed to fetch employee details");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user, authLoading, router]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => new Set([...prev, tabId]));
  };

  const getInitials = () => {
    if (!employee) return "?";
    const first = employee.first_name || "";
    const last = employee.last_name || "";
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-gray-600 dark:text-zinc-400 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-zinc-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            {error || "Unable to load your profile"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 shadow-xl border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-r from-blue-600 to-blue-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 text-lg mt-1">
                  {employee.emp_job_title?.name || "No Information Available"}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    employee.current_or_former_emp !== false
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300"
                  }`}
                >
                  {employee.current_or_former_emp !== false
                    ? "Active"
                    : "Former"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
        {/* About tab - always rendered since it's the default */}
        {activeTab === "about" && (
          <AboutPanel employee={employee} loading={false} error={null} />
        )}

        {/* Tasks tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("tasks") && (
          <TasksPanel
            employeeId={employee.id}
            isActive={activeTab === "tasks"}
          />
        )}

        {/* Leaves tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("leaves") && (
          <LeavesPanel
            employeeId={employee.id}
            isActive={activeTab === "leaves"}
            employee={employee}
            canRequestLeave={true}
          />
        )}

        {/* Attendance tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("attendance") && (
          <AttendancePanel
            employeeId={employee.id}
            isActive={activeTab === "attendance"}
            employee={employee}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;