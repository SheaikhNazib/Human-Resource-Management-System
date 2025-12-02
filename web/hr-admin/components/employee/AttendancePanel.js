"use client";

import React, { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Filter } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";
import { getMyAttendance } from "@/actions/attendances/server-actions";

const AttendancePanel = ({ employeeId, isActive, employee }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    if (isActive) {
      fetchAttendanceData();
    }
  }, [isActive, startDate, endDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyAttendance(startDate, endDate);
      if (response.success) {
        setAttendanceData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error);
        toast.error("Failed to load attendance records");
      }
    } catch (err) {
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
        return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold capitalize";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            My Attendance Records
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mt-1">
            View your attendance history
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Filter by date range:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-zinc-400">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-zinc-400">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {attendanceData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-zinc-400 text-lg">
                No attendance records found for the selected date range ({startDate} to {endDate})
              </p>
            </div>
          ) : (
            attendanceData.map((record) => (
              <div
                key={record.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <span className={getStatusBadge(record.status)}>
                          {record.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-zinc-400">
                        {record.checkIn && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Check In: {record.checkIn}
                          </span>
                        )}
                        {record.checkOut && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Check Out: {record.checkOut}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                      Hours Worked
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                      {record.hoursWorked}h
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePanel;
