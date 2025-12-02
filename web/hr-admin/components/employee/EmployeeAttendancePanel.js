"use client";

import React, { useState } from "react";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Filter, MapPin } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";
import { getEmployeeAttendances } from "@/actions/attendances/server-actions";

const EmployeeAttendancePanel = ({ employeeId, isActive, employee }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [hasFetched, setHasFetched] = useState(false);

  React.useEffect(() => {
    if (isActive && employeeId && !hasFetched) {
      fetchAttendances();
    }
  }, [isActive, employeeId]);

  const fetchAttendances = async () => {
    if (loading) return; // Prevent duplicate requests
    
    console.log('[EmployeeAttendancePanel] Starting fetch for employee:', employeeId);
    const startTime = Date.now();
    
    setLoading(true);
    setError(null);
    
    try {
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      
      const startDateStr = fmt(startDate);
      const endDateStr = fmt(endDate);

      console.log('[EmployeeAttendancePanel] Calling server action...');
      const response = await getEmployeeAttendances(employeeId, startDateStr, endDateStr);
      
      const duration = Date.now() - startTime;
      console.log(`[EmployeeAttendancePanel] Response received in ${duration}ms:`, response);
      
      if (response.success) {
        setAttendances(Array.isArray(response.data) ? response.data : []);
        setHasFetched(true);
        console.log('[EmployeeAttendancePanel] Attendance data set successfully');
      } else {
        setError(response.error);
        toast.error("Failed to load attendance records");
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[EmployeeAttendancePanel] Error after ${duration}ms:`, err);
      setError(err.message || "Failed to fetch attendance data");
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "late":
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "present":
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case "absent":
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`;
      case "late":
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`;
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    
    try {
      // Parse the time string (HH:MM:SS or HH:MM)
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      // Convert to 12-hour format
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      // Fallback to original format if parsing fails
      return time.length >= 5 ? time.slice(0, 5) : time;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const filteredAttendances = attendances.filter(attendance => {
    if (filterStatus === "all") return true;
    return attendance.status === filterStatus;
  });

  const totalRecords = attendances.length;
  const presentCount = attendances.filter(a => a.status === "present").length;
  const absentCount = attendances.filter(a => a.status === "absent").length;
  const lateCount = attendances.filter(a => a.status === "late").length;

  if (!isActive) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              Attendance Records
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              {employee?.first_name} {employee?.last_name}'s attendance history
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Total Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{totalRecords}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Present</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{presentCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Absent</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{absentCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Late</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{lateCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader size={32} />
          <span className="ml-3 text-gray-600 dark:text-zinc-400">Loading attendance records...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAttendances}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Attendance Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-zinc-400">
                {filterStatus === "all" ? "No attendance records found" : `No ${filterStatus} records found`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Hours Worked</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-zinc-300">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-zinc-100">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className={getStatusBadge(attendance.status)}>
                        {getStatusIcon(attendance.status)}
                        <span className="capitalize">{attendance.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-zinc-100">
                      {formatTime(attendance.checkIn)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-zinc-100">
                      {formatTime(attendance.checkOut)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-zinc-100">
                      {attendance.hoursWorked ? `${attendance.hoursWorked}h` : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-zinc-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">
                          {attendance.onsite_or_remote ? "Office" : "Remote"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400 max-w-xs truncate">
                      {attendance.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendancePanel;