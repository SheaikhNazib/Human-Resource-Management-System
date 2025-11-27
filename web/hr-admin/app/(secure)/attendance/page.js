"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  getEmployeesWithTodayAttendance,
  bulkSaveAttendance,
} from "@/actions/attendances/server-actions";
import { toast } from "sonner";
import TableArchive from "@/components/core/TableArchive";
import { toMessage } from "@/lib/utils";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [changedEmployeeIds, setChangedEmployeeIds] = useState(new Set());

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployeesWithTodayAttendance();

      if (result.success) {
        setEmployees(result.data);
        setChangedEmployeeIds(new Set()); // Reset changed employees when fetching fresh data
      } else {
        setError("Failed to fetch employees: " + result.error);
      }
    } catch (err) {
      toast.error("Failed to fetch employees: " + err.message);
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (employeeId, field, value) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === employeeId ? { ...emp, [field]: value } : emp
      )
    );

    // Mark this employee as changed
    setChangedEmployeeIds((prev) => new Set(prev).add(employeeId));
  };

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(query)) ||
        (emp.department && emp.department.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  // Human-friendly current date for display in the header
  const formattedDate = useMemo(() => {
    const date = new Date(selectedDate + "T00:00:00");
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  const handleUpdateAttendance = async () => {
    // Check if there are any changes
    if (changedEmployeeIds.size === 0) {
      toast.error(
        "No changes detected. Please modify attendance times before updating."
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Only prepare attendance records for employees that have been changed
      const changedEmployees = employees.filter((employee) =>
        changedEmployeeIds.has(employee.id)
      );

      const attendanceRecords = changedEmployees.map((employee) => ({
        employeeId: employee.id,
        employeeName: employee.name,
        date: selectedDate, // Use selected date instead of employee.date
        checkInTime: employee.checkInTime,
        checkOutTime: employee.checkOutTime,
        attendanceId: employee.attendanceId,
        remarks: employee.remarks || "",
      }));

      const result = await bulkSaveAttendance(attendanceRecords);

      if (result.success) {
        toast.success(
          `Successfully saved attendance for ${result.successCount} employee(s)!`
        );
        setChangedEmployeeIds(new Set()); // Clear changed employees after successful save
      } else if (result.successCount > 0) {
        toast.success(
          `Saved attendance for ${result.successCount} employee(s). ${result.failCount} failed.`
        );
        const failedEmployees = result.results
          .filter((r) => !r.success)
          .map((r) => {
            const emp = employees.find((e) => e.id === r.employeeId);
            const empName = emp?.name || `Employee ${r.employeeId}`;
            const errorMsg = r.error || "Unknown error";
            return `${empName} (${errorMsg})`;
          })
          .join(", ");
        toast.error(`Failed for: ${failedEmployees}`, { duration: 6000 });

        // Remove successfully saved employees from changed set
        const failedIds = new Set(
          result.results.filter((r) => !r.success).map((r) => r.employeeId)
        );
        setChangedEmployeeIds(failedIds);
      } else {
        const errorMsg =
          result.error || "All records failed - check console for details";
        toast.error("Failed to save attendance: " + errorMsg, {
          duration: 6000,
        });
        console.error("Bulk save result:", result);
      }

      // Refresh the form with updated data
      setTimeout(() => {
        setSuccessMessage("");
        fetchEmployees();
      }, 3000);
    } catch (err) {
      const errorMsg = err.message || err.toString() || "Unknown error";
      toast.error("Failed to update attendance: " + errorMsg);
      console.error("Error updating attendance:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Employee Name",
      accessor: "name",
      render: (emp) => {
        const initials = `${emp.firstName?.[0] || ""}${
          emp.lastName?.[0] || ""
        }`.toUpperCase();
        const hasAttendance =
          emp.attendanceId !== null && emp.checkInTime && emp.checkOutTime;
        const isChanged = changedEmployeeIds.has(emp.id);

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {initials || "—"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {emp.name}
                </div>
                {hasAttendance ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Recorded
                  </span>
                ) : emp.attendanceId !== null &&
                  emp.checkInTime &&
                  !emp.checkOutTime ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    ⏱ Checked In (No Checkout)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    ⚠ Not Recorded
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {emp.jobTitle || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Department",
      accessor: "department",
      render: (emp) => emp.department || "N/A",
    },
    {
      header: "Check In Time",
      accessor: "checkInTime",
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        return (
          <div className="relative">
            <input
              type="time"
              value={emp.checkInTime}
              onChange={(e) =>
                handleTimeChange(emp.id, "checkInTime", e.target.value)
              }
              className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm ${
                isChanged
                  ? "border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400 dark:ring-yellow-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </div>
        );
      },
    },
    {
      header: "Check Out Time",
      accessor: "checkOutTime",
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        const hasCheckOut = emp.checkOutTime && emp.checkOutTime !== "";
        const hasAttendanceId = emp.attendanceId !== null;

        return (
          <div className="relative">
            <input
              type="time"
              value={emp.checkOutTime}
              onChange={(e) =>
                handleTimeChange(emp.id, "checkOutTime", e.target.value)
              }
              className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm ${
                isChanged
                  ? "border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400 dark:ring-yellow-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
            {hasAttendanceId && !hasCheckOut && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-500 dark:text-red-400 whitespace-nowrap">
                ⚠ Not checked out yet
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Remarks",
      accessor: "remarks",
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        return (
          <div className="relative">
            <input
              type="text"
              value={emp.remarks || ""}
              onChange={(e) =>
                handleTimeChange(emp.id, "remarks", e.target.value)
              }
              placeholder="Remarks"
              className={`px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm w-full ${
                isChanged
                  ? "border-yellow-400 dark:border-yellow-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </div>
        );
      },
    },
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const recordedCount = employees.filter(
      (emp) => emp.attendanceId !== null && emp.checkInTime && emp.checkOutTime
    ).length;
    const checkedInOnlyCount = employees.filter(
      (emp) => emp.attendanceId !== null && emp.checkInTime && !emp.checkOutTime
    ).length;
    const notRecordedCount =
      totalEmployees - recordedCount - checkedInOnlyCount;
    const modifiedCount = changedEmployeeIds.size;

    return {
      totalEmployees,
      recordedCount,
      checkedInOnlyCount,
      notRecordedCount,
      modifiedCount,
    };
  }, [employees, changedEmployeeIds]);

  return (
    <div className="max-w-full min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {toMessage(error)}
            </p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <TableArchive
        title={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between w-full text-white">
              <span className="font-semibold text-lg">Employee Attendance</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                    style={{
                      colorScheme: "dark",
                    }}
                  />
                </div>
                <div className="hidden md:block text-sm text-white/90 font-medium bg-white/10 px-3 py-2 rounded-lg">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="group bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Total Employees
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-zinc-600 dark:text-zinc-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.totalEmployees}
                </div>
              </div>

              <div className="group bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                    Recorded
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {stats.recordedCount}
                </div>
              </div>

              <div className="group bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Checked In
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.checkedInOnlyCount}
                </div>
              </div>

              <div className="group bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Not Recorded
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-amber-600 dark:text-amber-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                  {stats.notRecordedCount}
                </div>
              </div>

              <div className="group bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                    Modified
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.modifiedCount}
                </div>
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        error={error}
        emptyMessage="No employees found."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, email, job title, or department..."
        createButtonOnClick={
          employees.length > 0 ? handleUpdateAttendance : null
        }
        createButtonText={
          submitting
            ? "Updating..."
            : changedEmployeeIds.size > 0
            ? `Update Attendance (${changedEmployeeIds.size})`
            : "Update Attendance"
        }
        createButtonClassName={`ml-2 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-lg ${
          changedEmployeeIds.size > 0
            ? "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 active:scale-100"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60"
        }`}
        showRefreshButton={true}
        onRefresh={fetchEmployees}
        className="max-w-full"
      />
    </div>
  );
}
