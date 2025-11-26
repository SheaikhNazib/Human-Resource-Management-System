"use client";

import React from "react";
import { User, Mail, MapPin, Briefcase, Info, Calendar } from "lucide-react";

/**
 * AboutPanel - Displays comprehensive employee information
 * @param {Object} props
 * @param {Object} props.employee - Employee data object
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
const AboutPanel = ({ employee, loading, error }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!employee) {
    return <EmptyState message="No employee data available" />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No Information Available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      role="tabpanel"
      id="panel-about"
      aria-labelledby="tab-about"
      className="animate-fadeIn"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                Personal Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="First Name" value={employee.first_name} />
              <InfoRow label="Last Name" value={employee.last_name} />
              <InfoRow label="Full Name" value={employee.name} />
              <InfoRow label="Employee ID" value={employee.id} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                Contact Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Personal Email" value={employee.personal_email} />
              <InfoRow label="Work Email" value={employee.work_email} />
              <InfoRow label="Mobile" value={employee.mobile} />
              <InfoRow label="Office Phone" value={employee.office_phone} />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                Address Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Address" value={employee.address} />
              <InfoRow
                label="Full Address"
                value={employee.full_address}
                multiline
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-700 rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                Employment Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Job Title" value={employee.emp_job_title?.name} />
              <InfoRow
                label="Department"
                value={employee.emp_department?.name}
              />
              <InfoRow label="Hire Date" value={formatDate(employee.hire_date)} />
              <InfoRow
                label="Leave Date"
                value={formatDate(employee.leave_date)}
              />
              <InfoRow
                label="Employment Status"
                value={
                  employee.current_or_former_emp === false
                    ? "Former Employee"
                    : "Current Employee"
                }
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 mt-6">
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-700 rounded-lg flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
              Additional Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="Created At"
              value={formatDate(employee.createdAt)}
            />
            <InfoRow
              label="Updated At"
              value={formatDate(employee.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying information rows
const InfoRow = ({ label, value, multiline = false }) => {
  return (
    <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 last:border-0">
      <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mb-1">{label}</p>
      <p
        className={`text-gray-800 dark:text-zinc-200 font-medium ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value || "No Information Available"}
      </p>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse mr-3" />
              <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-48 animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-full animate-pulse" />
                </div>
              ))}
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">Error Loading Data</h3>
        <p className="text-red-700 dark:text-red-300">{message}</p>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ message }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-gray-600 dark:text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">No Data</h3>
        <p className="text-gray-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
};

export default AboutPanel;
