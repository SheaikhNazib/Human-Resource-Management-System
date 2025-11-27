"use client";
import React, { useState, useRef, useEffect } from "react";

const LeaveStatusDropdown = ({ currentStatus, onStatusChange, leaveId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { value: "approved", label: "Approved", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { value: "unpaid approved", label: "Unpaid Approved", color: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 hover:bg-red-200" },

  ];

  const currentStatusObj = statusOptions.find(
    (s) => s.value === currentStatus?.toLowerCase()
  ) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus?.toLowerCase() || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onStatusChange(leaveId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
          flex items-center gap-2 min-w-[110px] justify-between
          ${currentStatusObj.color}
          ${disabled || isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${!disabled && !isUpdating ? "hover:shadow-sm" : ""}
        `}
      >
        <span className="flex items-center gap-1.5">
          {isUpdating ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <StatusIcon status={currentStatusObj.value} />
          )}
          {currentStatusObj.label}
        </span>
        {!disabled && !isUpdating && (
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && !disabled && !isUpdating && (
        <div className="fixed z-9999 mt-2 w-40 rounded-lg shadow-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden" 
          style={{
            top: dropdownRef.current?.getBoundingClientRect().bottom + window.scrollY + 8 + 'px',
            left: dropdownRef.current?.getBoundingClientRect().left + window.scrollX + 'px'
          }}>
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusChange(option.value)}
                disabled={option.value === currentStatus?.toLowerCase()}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center gap-2 transition-colors
                  ${option.value === currentStatus?.toLowerCase()
                    ? "bg-zinc-100 dark:bg-zinc-700 cursor-default opacity-50"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
                  }
                `}
              >
                <StatusIcon status={option.value} />
                <span className={getTextColor(option.value)}>{option.label}</span>
                {option.value === currentStatus?.toLowerCase() && (
                  <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIcon = ({ status }) => {
  const iconClass = "w-3.5 h-3.5";
  
  switch (status) {
    case "pending":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case "approved":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case "unpaid approved":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case "rejected":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case "cancelled":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

const getTextColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-700 dark:text-yellow-300";
    case "approved":
      return "text-green-700 dark:text-green-300";
    case "unpaid approved":
      return "text-amber-700 dark:text-amber-300";
    case "rejected":
      return "text-red-700 dark:text-red-300";
    case "cancelled":
      return "text-gray-700 dark:text-gray-300";
    default:
      return "text-gray-700 dark:text-gray-300";
  }
};

export default LeaveStatusDropdown;
