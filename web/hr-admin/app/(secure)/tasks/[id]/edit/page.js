"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Loader from "@/components/ui/Loader";
import * as Yup from "yup";
import { useTaskById, updateTaskClient } from "@/actions/tasks/business";
import { useEmployees } from "@/actions/employees/business";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string(),
  start_date_time: Yup.date().required("Start date is required"),
  end_date_time: Yup.date().required("End date is required"),
  estimated_time: Yup.string(),
  assigned_employees: Yup.array(),
  task_status: Yup.number().required(),
});

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { employees } = useEmployees();
  const { initialValues, loading, error } = useTaskById(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-slate-600 font-medium">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Error Loading Task
          </h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/tasks")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center">
          <div className="text-slate-400 text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Task Not Found
          </h2>
          <p className="text-slate-600 mb-4">
            The task you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/tasks")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-5">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left side - Back button and Title */}
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2 lg:p-2.5 hover:bg-slate-100 rounded-lg transition-colors group"
                title="Back"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 group-hover:text-slate-900 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                <div className="p-2.5 lg:p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate tracking-tight">
                    Edit Task
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-500 font-medium">
                    Modify task details and settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              const payload = {
                title: values.title,
                description: values.description,
                start_date_time: values.start_date_time || null,
                end_date_time: values.end_date_time || null,
                estimated_time: values.estimated_time || null,
                assigned_employees: Array.isArray(values.assigned_employees)
                  ? values.assigned_employees.map((v) => Number(v))
                  : [],
                task_status: Number(values.task_status),
              };

              const res = await updateTaskClient(id, payload);
              setSubmitting(false);
              if (res.success) {
                router.push("/tasks/list");
              } else {
                alert(res.error || "Update failed");
              }
            }}
          >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => (
              <Form className="p-6 sm:p-8 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Main Content - Left Column */}
                  <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-linear-to-br from-slate-50 to-blue-50/30 rounded-xl p-5 sm:p-6 lg:p-8 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5 lg:mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                          Basic Information
                        </h2>
                      </div>

                      <div className="space-y-5">
                        {/* Task Title */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Task Title <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="title"
                            className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 bg-white"
                            placeholder="Enter task title"
                          />
                          {errors.title && touched.title && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                              <span>⚠️</span> {errors.title}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                          </label>
                          <Field
                            as="textarea"
                            name="description"
                            rows={4}
                            className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 resize-none bg-white"
                            placeholder="Enter task description"
                          />
                          {errors.description && touched.description && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                              <span>⚠️</span> {errors.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scheduling Section */}
                    <div className="bg-linear-to-br from-slate-50 to-blue-50/30 rounded-xl p-5 sm:p-6 lg:p-8 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5 lg:mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                          Scheduling
                        </h2>
                      </div>

                      <div className="space-y-5">
                        {/* Date Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Start Date */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Start Date <span className="text-red-500">*</span>
                            </label>
                            <Field
                              type="date"
                              name="start_date_time"
                              className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
                            />
                            {errors.start_date_time &&
                              touched.start_date_time && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                  <span>⚠️</span> {errors.start_date_time}
                                </p>
                              )}
                          </div>

                          {/* End Date */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              End Date <span className="text-red-500">*</span>
                            </label>
                            <Field
                              type="date"
                              name="end_date_time"
                              className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
                            />
                            {errors.end_date_time && touched.end_date_time && (
                              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {errors.end_date_time}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Additional Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Estimated Time */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Estimated Time
                            </label>
                            <Field
                              name="estimated_time"
                              className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 bg-white"
                              placeholder="e.g. 5h"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Status <span className="text-red-500">*</span>
                            </label>
                            <Field
                              as="select"
                              name="task_status"
                              className="w-full px-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
                            >
                              <option value={1}>Open</option>
                              <option value={2}>In Progress</option>
                              <option value={3}>Done</option>
                            </Field>
                            {errors.task_status && touched.task_status && (
                              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {errors.task_status}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Right Column */}
                  <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                    {/* Assigned Employees */}
                    <div className="bg-linear-to-br from-slate-50 to-blue-50/30 rounded-xl p-5 sm:p-6 lg:p-8 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5 lg:mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg
                            className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
                          Team Members
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mb-4 lg:mb-5 font-medium">
                        Search and assign employees to this task
                      </p>
                      <AssignedEmployeesSelect
                        employees={employees}
                        value={values.assigned_employees}
                        onChange={(val) =>
                          setFieldValue("assigned_employees", val)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 lg:py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 lg:py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader size={20} className="inline-flex" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

function AssignedEmployeesSelect({ employees = [], value = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    function handleDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter((e) => {
      const name = (
        e.firstName ? `${e.firstName} ${e.lastName || ""}` : e.name || ""
      ).toLowerCase();
      const email = (e.email || "").toLowerCase();
      return name.includes(q) || email.includes(q) || String(e.id).includes(q);
    });
  }, [employees, query]);

  function add(id) {
    if ((value || []).includes(id)) return;
    onChange([...(value || []), id]);
    setQuery("");
    setOpen(false);
  }

  function remove(id) {
    onChange((value || []).filter((v) => v !== id));
  }

  function getInitials(emp) {
    const name = emp.firstName
      ? `${emp.firstName} ${emp.lastName || ""}`
      : emp.name || emp.email || "";
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  }

  const colors = [
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-green-400 to-green-600",
    "from-yellow-400 to-yellow-600",
    "from-red-400 to-red-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600",
  ];

  return (
    <div className="relative" ref={rootRef}>
      {/* Selected Employees Display */}
      {(value || []).length > 0 && (
        <div className="mb-4 space-y-2">
          {(value || []).map((id) => {
            const emp = employees.find((e) => e.id === id) || {
              id,
              name: `#${id}`,
            };
            const label = emp.firstName
              ? `${emp.firstName} ${emp.lastName || ""}`
              : emp.name || emp.email || `#${id}`;
            const initials = getInitials(emp);
            const colorClass = colors[id % colors.length];

            return (
              <div
                key={id}
                className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {label}
                  </div>
                  {emp.email && (
                    <div className="text-xs text-slate-500 truncate">
                      {emp.email}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search employees..."
          className="w-full pl-10 pr-4 py-2.5 lg:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400 bg-white"
        />
      </div>

      {/* Dropdown Menu */}
      {open && filtered && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-auto">
          {filtered.map((e) => {
            const label = e.firstName
              ? `${e.firstName} ${e.lastName || ""}`
              : e.name || e.email || `#${e.id}`;
            const initials = getInitials(e);
            const colorClass = colors[e.id % colors.length];
            const isSelected = (value || []).includes(e.id);

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => add(e.id)}
                disabled={isSelected}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  isSelected
                    ? "bg-slate-50 cursor-not-allowed opacity-50"
                    : "hover:bg-blue-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {label}
                  </div>
                  {e.email && (
                    <div className="text-xs text-slate-500 truncate">
                      {e.email}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {open && filtered && filtered.length === 0 && query && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-center">
          <div className="text-slate-400 text-sm">No employees found</div>
        </div>
      )}
    </div>
  );
}
