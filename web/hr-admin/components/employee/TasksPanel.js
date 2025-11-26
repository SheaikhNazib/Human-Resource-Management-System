"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, AlertCircle } from "lucide-react";
import TaskItem from "./TaskItem";
import { useTasks } from "@/actions/tasks/business";

/**
 * TasksPanel - Displays tasks assigned to an employee
 * @param {Object} props
 * @param {string|number} props.employeeId - Employee ID
 * @param {boolean} props.isActive - Whether this tab is currently active
 */
const TasksPanel = ({ employeeId, isActive }) => {
  const { tasks: allTasks, loading, error } = useTasks();
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!allTasks.length) return;

    // Filter tasks assigned to this employee (always keep cache updated)
    const filtered = allTasks.filter((task) => {
      if (!task.assigned_employees || !Array.isArray(task.assigned_employees)) {
        return false;
      }
      // Check if employee ID is in the assigned employees array
      // Handle both object format {id: X} and number format X
      return task.assigned_employees.some((emp) => {
        const empId = typeof emp === 'object' && emp !== null ? emp.id : emp;
        return String(empId) === String(employeeId);
      });
    });

    setEmployeeTasks(filtered);
    if (filtered.length > 0 || !loading) {
      setHasLoaded(true);
    }
  }, [allTasks, employeeId, loading]);

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

  if (employeeTasks.length === 0 && hasLoaded) {
    return (
      <EmptyState message="No tasks assigned to this employee" icon={Briefcase} />
    );
  }

  // Show cached data even if currently loading (for refresh scenarios)
  if (employeeTasks.length === 0 && !hasLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      role="tabpanel"
      id="panel-tasks"
      aria-labelledby="tab-tasks"
      className="animate-fadeIn"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            My Tasks ({employeeTasks.length})
          </h2>
        </div>

        <div className="space-y-4">
          {employeeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-3 animate-pulse" />
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
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
          Error Loading Tasks
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default TasksPanel;
