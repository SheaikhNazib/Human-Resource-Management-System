"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getEmployeeById } from "@/actions/employees/server-actions";
import {
  AlertCircle,
  User,
  Briefcase,
  Calendar,
  Edit,
  ChevronLeft,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toMessage } from "@/lib/utils";
import { toast } from "sonner";
import TabBar from "@/components/employee/TabBar";
import AboutPanel from "@/components/employee/AboutPanel";
import TasksPanel from "@/components/employee/TasksPanel";
import LeavesPanel from "@/components/employee/LeavesPanel";
import AttendancePanel from "@/components/employee/AttendancePanel";
import { UserCircle, ClipboardList, CalendarDays, Clock } from "lucide-react";

const TABS = [
  { id: "about", label: "About", icon: UserCircle },
  { id: "tasks", label: "My Tasks", icon: ClipboardList },
  { id: "leaves", label: "Leaves", icon: CalendarDays },
  { id: "attendance", label: "Attendance", icon: Clock },
];

const EmployeeDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "about"
  );
  const [visitedTabs, setVisitedTabs] = useState(new Set(["about"]));

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getEmployeeById(params.id);

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
  }, [params.id]);

  useEffect(() => {
    // Sync URL with active tab
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => new Set([...prev, tabId]));
    // Update URL without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url.toString());
  };

  const getInitials = () => {
    if (!employee) return "?";
    const first = employee.first_name || "";
    const last = employee.last_name || "";
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-gray-600 dark:text-zinc-400 font-medium">
            Loading employee details...
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
            {error || "Employee not found"}
          </p>
          <button
            onClick={() => router.push("/employees")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Back to Employees
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
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => router.push("/employees")}
                className="inline-flex items-center gap-2 h-10 px-3 bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                aria-label="Back to employees list"
                title="Back to employees"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to List</span>
              </button>

              <button
                onClick={() => router.push(`/employees/${employee.id}/edit`)}
                className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-shadow shadow-md"
                aria-label="Edit employee profile"
                title="Edit profile"
              >
                <span className="sr-only">Edit employee</span>
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Profile</span>
              </button>
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
          <div className="animate-tabFadeIn">
            <AboutPanel employee={employee} loading={false} error={null} />
          </div>
        )}

        {/* Tasks tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("tasks") && (
          <div
            className={activeTab === "tasks" ? "animate-tabFadeIn" : "hidden"}
          >
            <TasksPanel
              employeeId={employee.id}
              isActive={activeTab === "tasks"}
            />
          </div>
        )}

        {/* Leaves tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("leaves") && (
          <div
            className={activeTab === "leaves" ? "animate-tabFadeIn" : "hidden"}
          >
            <LeavesPanel
              employeeId={employee.id}
              isActive={activeTab === "leaves"}
              employee={employee}
            />
          </div>
        )}

        {/* Attendance tab - only mount after first visit, then keep mounted but hidden */}
        {visitedTabs.has("attendance") && (
          <div
            className={activeTab === "attendance" ? "animate-tabFadeIn" : "hidden"}
          >
            <AttendancePanel
              employeeId={employee.id}
              isActive={activeTab === "attendance"}
              employee={employee}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;
