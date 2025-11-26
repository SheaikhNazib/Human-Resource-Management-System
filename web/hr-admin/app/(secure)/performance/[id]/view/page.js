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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Performance Details
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              View employee performance record
            </p>
          </div>
          <Link
            href={`/performance/${id}/edit`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg sm:rounded-xl shadow p-4 sm:p-6 space-y-6">
        {/* Employee Info */}
        <div>
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
                Work Email
              </label>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {employee.work_email || employee.personal_email || "—"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Mobile
              </label>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {employee.mobile || "—"}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Performance Details */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Performance Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Score
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-3 py-1 rounded text-white text-sm font-medium ${
                    score <= 3
                      ? "bg-red-500"
                      : score <= 6
                      ? "bg-yellow-400 text-black"
                      : score <= 8
                      ? "bg-amber-400 text-black"
                      : "bg-green-500"
                  }`}
                >
                  {score} / 10
                </span>
                <span className="text-sm text-zinc-500">
                  {score <= 3
                    ? "Poor"
                    : score <= 6
                    ? "Fair"
                    : score <= 8
                    ? "Good"
                    : "Excellent"}
                </span>
              </div>
            </div>

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
              <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                {feedback || "No feedback provided"}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* Metadata */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Record Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Created At
              </label>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {performance?.createdAt
                  ? new Date(performance.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Updated At
              </label>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {performance?.updatedAt
                  ? new Date(performance.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/performance"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
        >
          ← Back to List
        </Link>
        <Link
          href={`/performance/${id}/edit`}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow"
        >
          Edit Performance
        </Link>
      </div>
    </div>
  );
}
