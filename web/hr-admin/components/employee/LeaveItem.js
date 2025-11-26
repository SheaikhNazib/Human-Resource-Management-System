"use client";

import React from "react";
import { Calendar, FileText, CheckCircle2, XCircle, Clock, Heart, Briefcase, Plane } from "lucide-react";

/**
 * LeaveItem - Individual leave display component
 * @param {Object} props
 * @param {Object} props.leave - Leave data object
 * @param {Function} props.inferLeaveType - Function to infer leave type from reason
 */
const LeaveItem = ({ leave, inferLeaveType }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = String(status).toLowerCase();
    const statusMap = {
      pending: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
      },
      denied: {
        label: "Denied",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    };
    return (
      statusMap[normalizedStatus] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      }
    );
  };

  const statusConfig = getStatusConfig(leave.status);
  const StatusIcon = statusConfig.icon;

  // Extract leave type and notes from reason field
  const parseReason = () => {
    if (!leave.reason) return { type: 'casual', displayReason: '' };
    
    const reason = leave.reason;
    
    // Check if reason starts with leave type label
    if (reason.startsWith('Casual Leave')) {
      const notes = reason.replace('Casual Leave', '').replace(/^[\s-]+/, '').trim();
      return { type: 'casual', displayReason: notes };
    }
    if (reason.startsWith('Sick Leave')) {
      const notes = reason.replace('Sick Leave', '').replace(/^[\s-]+/, '').trim();
      return { type: 'sick', displayReason: notes };
    }
    if (reason.startsWith('Annual Leave')) {
      const notes = reason.replace('Annual Leave', '').replace(/^[\s-]+/, '').trim();
      return { type: 'annual', displayReason: notes };
    }
    
    // Fallback to inference function or full reason
    const inferredType = inferLeaveType ? inferLeaveType(reason) : 'casual';
    return { type: inferredType, displayReason: reason };
  };

  const { type: leaveType, displayReason } = parseReason();
  
  const getLeaveTypeConfig = (type) => {
    const normalizedType = String(type).toLowerCase();
    if (normalizedType.includes('sick')) {
      return { label: "Sick Leave", color: "bg-green-100 text-green-800", icon: Heart };
    }
    if (normalizedType.includes('annual')) {
      return { label: "Annual Leave", color: "bg-purple-100 text-purple-800", icon: Plane };
    }
    return { label: "Casual Leave", color: "bg-blue-100 text-blue-800", icon: Briefcase };
  };

  const leaveTypeConfig = getLeaveTypeConfig(leaveType);
  const LeaveTypeIcon = leaveTypeConfig.icon;

  const calculateDuration = () => {
    if (!leave.startDate || !leave.endDate) return null;
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${leaveTypeConfig.color}`}>
              <LeaveTypeIcon className="w-3 h-3" />
              <span>{leaveTypeConfig.label}</span>
            </span>
            {duration && (
              <span className="text-sm text-gray-500">
                • {duration} {duration === 1 ? "day" : "days"}
              </span>
            )}
          </div>
        </div>
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>From: {formatDate(leave.startDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>To: {formatDate(leave.endDate)}</span>
          </div>
        </div>
      </div>

      {displayReason && (
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-600 line-clamp-2">{displayReason}</p>
          </div>
        </div>
      )}

      {leave.approvedBy && leave.approvedAt && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          Approved on {formatDate(leave.approvedAt)}
        </div>
      )}
    </div>
  );
};

export default LeaveItem;
