"use client";

import React, { useEffect, useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import LeaveItem from "./LeaveItem";
import LeaveSummaryCard from "./LeaveSummaryCard";
import { useLeaves } from "@/actions/leaves/business";
import { useLeavePolicy } from "@/hooks/useLeavePolicy";

/**
 * LeavesPanel - Displays leave history for an employee with policy calculations
 * @param {Object} props
 * @param {string|number} props.employeeId - Employee ID
 * @param {boolean} props.isActive - Whether this tab is currently active
 * @param {Object} props.employee - Employee data with hire_date
 */
const LeavesPanel = ({ employeeId, isActive, employee }) => {
  const { leaves: allLeaves, loading, error } = useLeaves();
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    denied: 0,
  });

  // Calculate leave policy based on employee's hire date
  const leavePolicy = useLeavePolicy(employee?.hire_date, employeeLeaves);

  useEffect(() => {
    if (!allLeaves.length) return;

    // Filter leaves for this employee (always keep cache updated)
    const filtered = allLeaves.filter((leave) => {
      // Handle various employee ID formats
      const leaveEmpId = leave.employeeId || leave.employee_id || leave.employee;
      // Skip if no employee ID found
      if (!leaveEmpId) return false;
      return String(leaveEmpId) === String(employeeId);
    });

    // Calculate summary
    const newSummary = {
      total: filtered.length,
      approved: filtered.filter(
        (l) => String(l.status).toLowerCase() === "approved"
      ).length,
      pending: filtered.filter(
        (l) => String(l.status).toLowerCase() === "pending"
      ).length,
      denied: filtered.filter((l) =>
        ["denied", "rejected"].includes(String(l.status).toLowerCase())
      ).length,
    };

    setEmployeeLeaves(filtered);
    setSummary(newSummary);
    if (filtered.length > 0 || !loading) {
      setHasLoaded(true);
    }
  }, [allLeaves, employeeId, loading]);

  if (!isActive) {
    // Keep component mounted but hidden to preserve cached data
    return <div className="hidden" />;
  }

  // Only show loading skeleton if data hasn't been loaded yet
  if (loading && !hasLoaded) {
    return <LoadingSkeleton />;
  }

  if (error && !hasLoaded) {
    return <ErrorState message={error} />;
  }

  if (employeeLeaves.length === 0 && hasLoaded) {
    return (
      <EmptyState
        message="No leave records found for this employee"
        icon={Calendar}
      />
    );
  }

  // Show cached data even if currently loading (for refresh scenarios)
  if (employeeLeaves.length === 0 && !hasLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      role="tabpanel"
      id="panel-leaves"
      aria-labelledby="tab-leaves"
      className="animate-fadeIn"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Leave Policy Summary Card */}
        <LeaveSummaryCard leavePolicy={leavePolicy} employee={employee} />

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Total Requests"
            value={summary.total}
            color="bg-blue-100 text-blue-800"
          />
          <SummaryCard
            label="Approved"
            value={summary.approved}
            color="bg-green-100 text-green-800"
          />
          <SummaryCard
            label="Pending"
            value={summary.pending}
            color="bg-yellow-100 text-yellow-800"
          />
          <SummaryCard
            label="Denied"
            value={summary.denied}
            color="bg-red-100 text-red-800"
          />
        </div>

        {/* Leave List Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Leave History</h2>
        </div>

        {/* Leave Items */}
        <div className="space-y-4">
          {employeeLeaves.map((leave) => (
            <LeaveItem 
              key={leave.id} 
              leave={leave}
              inferLeaveType={leavePolicy.inferLeaveType}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Summary card component
const SummaryCard = ({ label, value, color }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color.split(" ")[1]}`}>{value}</p>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Summary skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />

      {/* Leave items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Error state component
const ErrorState = ({ message }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error Loading Leaves
        </h3>
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ message, icon: Icon }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leaves</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LeavesPanel;
