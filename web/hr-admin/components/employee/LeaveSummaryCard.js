"use client";

import React from "react";
import { Calendar, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

/**
 * LeaveSummaryCard - Displays leave quota summary with policy information
 * @param {Object} props
 * @param {Object} props.leavePolicy - Leave policy calculations from useLeavePolicy hook
 * @param {Object} props.employee - Employee data with hire_date
 */
const LeaveSummaryCard = ({ leavePolicy, employee }) => {
  const {
    casual,
    sick,
    annual,
    monthsSinceJoining,
    isEligibleForCasual,
    isEligibleForAnnual,
  } = leavePolicy;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              Leave Balance Summary
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Current Year • {monthsSinceJoining} months since joining
            </p>
          </div>
        </div>
      </div>

      {/* Leave Quota Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Casual Leave */}
        <LeaveQuotaCard
          title="Casual Leave"
          total={casual.total}
          used={casual.used}
          remaining={casual.remaining}
          eligible={casual.eligible}
          color="blue"
          icon={Calendar}
          eligibilityMessage={
            !isEligibleForCasual ? "Eligible after 3 months" : null
          }
        />

        {/* Sick Leave */}
        <LeaveQuotaCard
          title="Sick Leave"
          total={sick.total}
          used={sick.used}
          remaining={sick.remaining}
          eligible={sick.eligible}
          color="green"
          icon={CheckCircle2}
          eligibilityMessage={null}
        />

        {/* Annual Leave */}
        <LeaveQuotaCard
          title="Annual Leave"
          total={annual.total}
          used={annual.used}
          remaining={annual.remaining}
          eligible={annual.eligible}
          color="purple"
          icon={CheckCircle2}
          eligibilityMessage={
            !isEligibleForAnnual ? "Eligible after 12 months" : null
          }
        />
      </div>

      {/* Policy Information */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-zinc-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium mb-1">Leave Policy:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Casual Leave: 10 days/year (eligible after 3 months)</li>
              <li>Sick Leave: 14 days/year (prorated first 3 months)</li>
              <li>Annual Leave: 14 days/year (eligible after 12 months)</li>
              <li>
                Quota calculated based on months worked in current calendar year
              </li>
              <li>Only approved leaves count towards quota usage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * LeaveQuotaCard - Individual leave type quota display
 */
const LeaveQuotaCard = ({
  title,
  total,
  used,
  remaining,
  eligible,
  color,
  icon: Icon,
  eligibilityMessage,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
      progress: "bg-blue-500",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      badge: "bg-green-100 text-green-800",
      progress: "bg-green-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      badge: "bg-purple-100 text-purple-800",
      progress: "bg-purple-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const usagePercentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className={`${colors.bg} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        </div>
        {!eligible && (
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
            Not Eligible
          </span>
        )}
      </div>

      {eligible ? (
        <>
          {/* Leave Numbers */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Used</p>
              <p className="text-lg font-bold text-gray-900">{used}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Left</p>
              <p
                className={`text-lg font-bold ${
                  remaining > 0 ? colors.text : "text-red-600"
                }`}
              >
                {remaining}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`${colors.progress} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          {/* Usage Text */}
          <p className="text-xs text-gray-600 text-center">
            {used} of {total} days used ({Math.round(usagePercentage)}%)
          </p>
        </>
      ) : (
        <div className="text-center py-4">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600">{eligibilityMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LeaveSummaryCard;
