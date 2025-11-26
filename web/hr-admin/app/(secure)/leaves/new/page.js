"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLeaveClient } from "@/actions/leaves/business";
import { useEmployees } from "@/actions/employees/business";
import {
  Calendar,
  FileText,
  User,
  Clock,
  Briefcase,
  Heart,
  Plane,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import AutoComplete from "@/components/ui/autoComplete";

export default function NewLeavePage() {
  const router = useRouter();
  const { employees, loading: loadingEmployees } = useEmployees();

  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    leave_type: "",
    additional_notes: "",
    status: "pending",
  });

  const leaveTypes = [
    { value: "casual", label: "Casual Leave", icon: Briefcase, color: "blue" },
    { value: "sick", label: "Sick Leave", icon: Heart, color: "green" },
    { value: "annual", label: "Annual Leave", icon: Plane, color: "purple" },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = "Please select an employee";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }

    if (!formData.leave_type) {
      newErrors.leave_type = "Leave type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEmployeeChange = (value) => {
    setFormData((prev) => ({ ...prev, employee_id: value }));
    if (errors.employee_id) {
      setErrors((prev) => ({ ...prev, employee_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setLoading(true);

    // Ensure employee_id is a valid integer
    const employeeId = parseInt(formData.employee_id, 10);
    console.log(
      "Form employee_id:",
      formData.employee_id,
      "Parsed:",
      employeeId
    );

    if (!employeeId || isNaN(employeeId)) {
      setError("Please select a valid employee");
      setLoading(false);
      return;
    }

    // Calculate leave days
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end - start);
    const leave_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Map leave_type to reason field for backend compatibility
    const selectedLeaveType = leaveTypes.find(
      (type) => type.value === formData.leave_type
    );
    const reasonText = selectedLeaveType
      ? selectedLeaveType.label
      : formData.leave_type;

    const leaveData = {
      employee: employeeId,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason:
        reasonText +
        (formData.additional_notes
          ? ` - ${formData.additional_notes.trim()}`
          : ""),
      status: formData.status,
      leave_days: leave_days,
    };

    console.log("Submitting leave data from page:", leaveData);

    const result = await createLeaveClient(leaveData);

    setLoading(false);

    if (result.success) {
      router.push("/leaves");
    } else {
      setError(result.error || "Failed to create leave request");
    }
  };

  const handleCancel = () => {
    router.push("/leaves");
  };

  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return null;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (end < start) return null;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
            Add Leave Request
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2">
            Submit a new leave request for an employee
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Leave Request Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Employee *
              </label>
              <AutoComplete
                options={employees.map((emp) => ({
                  id: emp.id,
                  name: `${emp.firstName} ${emp.lastName} (${emp.email})`,
                }))}
                value={formData.employee_id}
                onChange={handleEmployeeChange}
                placeholder={
                  loadingEmployees
                    ? "Loading employees..."
                    : "Search and select an employee"
                }
                disabled={loadingEmployees}
                error={errors.employee_id}
                className="w-full"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.start_date
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-zinc-700"
                  }`}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.end_date
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-zinc-700"
                  }`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* Duration Display */}
            {duration !== null && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">
                    Total Duration: {duration} day{duration !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Leave Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Leave Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {leaveTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.leave_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          leave_type: type.value,
                        }));
                        if (errors.leave_type) {
                          setErrors((prev) => ({ ...prev, leave_type: "" }));
                        }
                      }}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                            : "border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600"
                        }
                        ${
                          errors.leave_type && !isSelected
                            ? "border-red-300"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? `bg-${type.color}-100 dark:bg-${type.color}-800/30`
                              : "bg-gray-100 dark:bg-zinc-800"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected
                                ? `text-${type.color}-600 dark:text-${type.color}-400`
                                : "text-gray-600 dark:text-zinc-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold text-sm ${
                              isSelected
                                ? `text-${type.color}-700 dark:text-${type.color}-300`
                                : "text-gray-700 dark:text-zinc-300"
                            }`}
                          >
                            {type.label}
                          </div>
                          {isSelected && (
                            <div
                              className={`text-xs mt-0.5 text-${type.color}-600 dark:text-${type.color}-400`}
                            >
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.leave_type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.leave_type}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Notes (Optional)
              </label>
              <textarea
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any additional details about this leave request..."
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingEmployees}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="inline-flex" />
                    Creating...
                  </>
                ) : (
                  "Create Leave Request"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-500">
          <p>All fields marked with * are required</p>
        </div>
      </div>
    </div>
  );
}
