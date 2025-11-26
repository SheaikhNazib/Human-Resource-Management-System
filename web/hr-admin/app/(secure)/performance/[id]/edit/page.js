"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getPerformance,
  updatePerformance,
} from "@/actions/performance/server-actions";
import { useEmployees } from "@/actions/employees";
import AutoComplete from "@/components/ui/autoComplete";

export default function EditPerformancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { employees, loading: loadingEmployees } = useEmployees();
  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPerformance() {
      if (!id) return;
      setLoading(true);
      const result = await getPerformance(id);
      if (result.success) {
        const data = result.data;
        setEmployeeId(data.employee?.id || "");
        setRating(data.score ?? 0);
        setNotes(data.feedback || "");
        setReviewer(data.reviewer || "");
      } else {
        setError(result.error || "Failed to load performance record");
      }
      setLoading(false);
    }
    fetchPerformance();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const resolvedEmployeeId = Number(employeeId ?? null);
    if (!resolvedEmployeeId) return setError("Employee is required");
    setSaving(true);

    const result = await updatePerformance(id, {
      employee_id: resolvedEmployeeId,
      rating,
      notes,
      reviewer,
    });

    setSaving(false);

    if (result.success) {
      router.push(`/performance/${id}/view`);
    } else {
      setError(result.error || "Failed to update performance");
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-zinc-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Edit Employee Performance
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Update performance details for this employee.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-lg sm:rounded-xl shadow p-4 sm:p-6"
      >
        <div className="mb-4">
          <AutoComplete
            label="Employee *"
            options={employees}
            value={employeeId}
            onChange={setEmployeeId}
            displayKey="displayName"
            placeholder={
              loadingEmployees ? "Loading employees..." : "Search employee..."
            }
            disabled={loadingEmployees}
            error={error && !employeeId ? "Employee is required" : ""}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Rating (1-10)
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-transparent p-1 rounded-md">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                  const active = star <= (hoverRating || rating);
                  const colorClass =
                    rating <= 3
                      ? "text-red-500"
                      : rating <= 6
                      ? "text-yellow-400"
                      : rating <= 8
                      ? "text-amber-400"
                      : "text-green-400";
                  return (
                    <button
                      key={`star-${star}`}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setRating(star);
                        }
                      }}
                      aria-label={`Set rating ${star} out of 10`}
                      title={`${star} / 10`}
                      className={`p-1 transition-transform focus:outline-none rounded ${
                        active ? "scale-105" : ""
                      }`}
                    >
                      <svg
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          active
                            ? colorClass
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                        viewBox="0 0 24 24"
                        fill={active ? "currentColor" : "none"}
                        stroke={active ? "none" : "currentColor"}
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rating || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") return setRating(0);
                      const val = Number(raw);
                      if (!Number.isNaN(val))
                        setRating(Math.min(10, Math.max(1, val)));
                    }}
                    className="w-16 rounded-lg border px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-center"
                    aria-label="Numeric rating 1 to 10"
                    placeholder="—"
                  />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    / 10
                  </span>
                </div>
                <div className="ml-1">
                  {rating > 0 ? (
                    <>
                      <div className="text-sm font-medium">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-white text-xs ${
                            rating <= 3
                              ? "bg-red-500"
                              : rating <= 6
                              ? "bg-yellow-400 text-black"
                              : rating <= 8
                              ? "bg-amber-400 text-black"
                              : "bg-green-500"
                          }`}
                        >
                          {rating}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {rating <= 3
                          ? "Poor"
                          : rating <= 6
                          ? "Fair"
                          : rating <= 8
                          ? "Good"
                          : "Excellent"}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400 mt-1">
                      No rating yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Reviewer
          </label>
          <input
            type="text"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            placeholder="Name of the reviewer (optional)"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Feedback / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full rounded-lg border px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            placeholder="Optional feedback or review comments"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <Link
            href={`/performance/${id}/view`}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-300 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Performance"}
          </button>
        </div>
      </form>
    </div>
  );
}
