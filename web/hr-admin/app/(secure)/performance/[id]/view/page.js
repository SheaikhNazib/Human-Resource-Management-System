"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPerformance } from "@/actions/performance/server-actions";
import Loader from "@/components/ui/Loader";
import { toMessage } from "@/lib/utils";

export default function ViewPerformancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPerformance() {
      if (!id) return;
      setLoading(true);
      const result = await getPerformance(id);
      if (result.success) {
        setPerformance(result.data);
      } else {
        setError(result.error || "Failed to load performance record");
      }
      setLoading(false);
    }
    fetchPerformance();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-center py-12">
          <Loader size={32} />
          <span className="ml-3 text-zinc-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">
            {toMessage(error)}
          </p>
        </div>
        <div className="mt-4">
          <Link
            href="/performance"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to performance list
          </Link>
        </div>
      </div>
    );
  }

  const employee = performance?.employee || {};
  const score = performance?.score ?? 0;
  const reviewDate = performance?.review_date ?? performance?.createdAt;
  const feedback = performance?.feedback ?? "";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Performance Details
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Detailed view of the employee's performance record
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/performance"
              className="inline-flex items-center gap-2 h-10 px-3 bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              ← Back
            </Link>

            <Link
              href={`/performance/${id}/edit`}
              className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-shadow shadow"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Main column */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-lg sm:rounded-xl shadow p-4 sm:p-6 space-y-6 flex flex-col h-full">
          {/* Employee Info */}
          <section>
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
              Employee Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Name
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {employee.name || "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Employee ID
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {employee.id || "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Job Title
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {employee.job_title || "—"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Contact
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {employee.work_email ||
                    employee.personal_email ||
                    employee.mobile ||
                    "—"}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Performance Details */}
          <section>
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
              Performance Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Review Date
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {reviewDate ? new Date(reviewDate).toLocaleDateString() : "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Reviewer
                </label>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {performance?.reviewer || "—"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Feedback / Notes
                </label>
                <div className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded">
                  {feedback || "No feedback provided"}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="md:col-span-1 flex flex-col gap-4 h-full">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Score
            </div>
            <div>
              <div
                className={`mx-auto flex items-center justify-center rounded-full shadow-md ${
                  score <= 3
                    ? "bg-red-500 text-white"
                    : score <= 6
                    ? "bg-yellow-400 text-black"
                    : score <= 8
                    ? "bg-amber-400 text-black"
                    : "bg-green-500 text-white"
                }`}
                style={{ width: 96, height: 96 }}
              >
                <span className="text-2xl font-semibold">{score}</span>
              </div>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {score <= 3
                ? "Poor"
                : score <= 6
                ? "Fair"
                : score <= 8
                ? "Good"
                : "Excellent"}
            </div>
            <div className="text-xs text-zinc-500">{score} / 10</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
              Record Information
            </h3>
            <dl className="text-sm text-zinc-900 dark:text-zinc-100 space-y-2">
              <div>
                <dt className="text-xs text-zinc-500">Created</dt>
                <dd>
                  {performance?.createdAt
                    ? new Date(performance.createdAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Updated</dt>
                <dd>
                  {performance?.updatedAt
                    ? new Date(performance.updatedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Record ID</dt>
                <dd className="truncate max-w-full">
                  {performance?.id || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
