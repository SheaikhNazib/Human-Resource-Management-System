"use client";

import React, { useState } from "react";
import { X, Calendar, FileText, Briefcase, Heart, Plane, Clock } from "lucide-react";
import { toast } from "sonner";
import { createLeaveClient } from "@/actions/leaves/business";

const LeaveRequestModal = ({ isOpen, onClose, employeeId, onSuccess }) => {
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    leave_type: "",
    additional_notes: "",
  });

  const leaveTypes = [
    { value: "casual", label: "Casual Leave", icon: Briefcase, color: "blue" },
    { value: "sick", label: "Sick Leave", icon: Heart, color: "green" },
    { value: "annual", label: "Annual Leave", icon: Plane, color: "purple" },
  ];

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

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

  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return null;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (end < start) return null;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
      employee: parseInt(employeeId, 10),
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason:
        reasonText +
        (formData.additional_notes
          ? ` - ${formData.additional_notes.trim()}`
          : ""),
      status: "pending",
      leave_days: leave_days,
    };

    try {
      const result = await createLeaveClient(leaveData);

      if (result.success) {
        toast.success("Leave request submitted successfully!");
        setFormData({
          start_date: "",
          end_date: "",
          leave_type: "",
          additional_notes: "",
        });
        setErrors({});
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Failed to submit leave request");
      }
    } catch (error) {
      toast.error("An error occurred while submitting leave request");
    } finally {
      setLoading(false);
    }
  };

  const duration = calculateDuration();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                Request Leave
              </h2>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Submit a new leave request
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 ${
                  errors.start_date
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.start_date}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 ${
                  errors.end_date
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.end_date}
                </p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {duration && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  Duration: {duration} {duration === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
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
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                        : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                    disabled={loading}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isSelected
                          ? `text-${type.color}-600 dark:text-${type.color}-400`
                          : "text-gray-600 dark:text-zinc-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        isSelected
                          ? `text-${type.color}-700 dark:text-${type.color}-300`
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.leave_type && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.leave_type}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Provide any additional information about your leave request..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
