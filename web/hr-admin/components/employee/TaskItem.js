"use client";

import React from "react";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * TaskItem - Individual task display component
 * @param {Object} props
 * @param {Object} props.task - Task data object
 */
const TaskItem = ({ task }) => {
  const router = useRouter();

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (statusId) => {
    const statusMap = {
      1: {
        label: "To Do",
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
      },
      2: {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      },
      3: {
        label: "Done",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
      },
    };
    return statusMap[statusId] || statusMap[1];
  };

  const statusConfig = getStatusConfig(task.task_status);
  const StatusIcon = statusConfig.icon;

  const handleClick = () => {
    router.push(`/tasks/${task.id}/view`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
          {task.title || "Untitled Task"}
        </h3>
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Start: {formatDate(task.start_date_time)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>Due: {formatDate(task.end_date_time)}</span>
        </div>
        {task.estimated_time && (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_time}h</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
