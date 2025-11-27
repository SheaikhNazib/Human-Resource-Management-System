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
  const { leaves: allLeaves, loading, error, refetch } = useLeaves();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Memoize filtered leaves to avoid recalculation on every render
  const employeeLeaves = React.useMemo(() => {
    if (!allLeaves.length) return [];
    
    return allLeaves.filter((leave) => {
      const leaveEmpId = leave.employeeId || leave.employee_id || leave.employee;
      if (!leaveEmpId) return false;
      return String(leaveEmpId) === String(employeeId);
    });
  }, [allLeaves, employeeId]);

  // Memoize summary calculation
  const summary = React.useMemo(() => {
    if (!employeeLeaves.length) {
      return {
        total: 0,
        approved: 0,
        pending: 0,
        denied: 0,
        unpaid: 0,
      };
    }

    const summary = {
      total: employeeLeaves.length,
      approved: 0,
      pending: 0,
      denied: 0,
      unpaid: 0,
    };

    for (const leave of employeeLeaves) {
      const status = String(leave.status).toLowerCase();
      if (status === "approved") {
        summary.approved++;
      } else if (status === "pending") {
        summary.pending++;
      } else if (status === "denied" || status === "rejected") {
        summary.denied++;
      } else if (status === "unpaid approved") {
        summary.unpaid++;
      }
    }

    return summary;
  }, [employeeLeaves]);

  // Calculate leave policy based on employee's hire date (only for approved leaves)
  const approvedLeaves = React.useMemo(() => {
    return employeeLeaves.filter(
      (l) => String(l.status).toLowerCase() === "approved" || String(l.status).toLowerCase() === "unpaid approved"
    );
  }, [employeeLeaves]);

  const leavePolicy = useLeavePolicy(employee?.hire_date, approvedLeaves);

  useEffect(() => {
    if ((employeeLeaves.length > 0 || !loading) && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [employeeLeaves.length, loading, hasLoaded]);

  // Failsafe: if loading takes too long, show an error message instead of an infinite skeleton
  useEffect(() => {
    let t;
    if (loading) {
      setTimedOut(false);
      t = setTimeout(() => {
        console.warn("LeavesPanel: loading timeout reached");
        setTimedOut(true);
      }, 20000); // 12s (slightly longer than axios default timeout)
    } else {
      setTimedOut(false);
    }
    return () => clearTimeout(t);
  }, [loading]);

  if (!isActive) {
    // Keep component mounted but hidden to preserve cached data
    return <div className="hidden" />;
  }

  // Only show loading skeleton if data hasn't been loaded yet and there's no error/timeout
  if (loading && !hasLoaded && !error && !timedOut) {
    return <LoadingSkeleton />;
  }

  // Show error if the hook reported an error or if loading timed out
  if ((error || timedOut) && !hasLoaded) {
    const msg = timedOut ? "Loading leaves is taking longer than usual. Please try again." : error;
    return <ErrorState message={msg} onRetry={() => refetch && refetch()} />;
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <SummaryCard
            label="Total Requests"
            value={summary.total}
            color="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          />
          <SummaryCard
            label="Approved"
            value={summary.approved}
            color="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          />
          <SummaryCard
            label="Pending"
            value={summary.pending}
            color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          />
          <SummaryCard
            label="Denied"
            value={summary.denied}
            color="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          />
          <SummaryCard
            label="Unpaid Leaves"
            value={summary.unpaid}
            color="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
          />
        </div>

        {/* Leave List Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Leave History</h2>
        </div>

        {/* Leave Items or Empty State */}
        {employeeLeaves.length === 0 ? (
          <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
              No Leave Records
            </h3>
            <p className="text-gray-600 dark:text-zinc-400">
              This employee has not submitted any leave requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {employeeLeaves.map((leave) => (
              <LeaveItem
                key={leave.id}
                leave={leave}
                inferLeaveType={leavePolicy.inferLeaveType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Summary card component
const SummaryCard = ({ label, value, color }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4"
          >
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24 mb-2 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-48 mb-4 animate-pulse" />

      {/* Leave items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-32 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-5/6 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Error state component
const ErrorState = ({ message, onRetry }) => {
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
        {onRetry ? (
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ message, icon: Icon }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-600 dark:text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
          No Leaves
        </h3>
        <p className="text-gray-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
};

export default LeavesPanel;
