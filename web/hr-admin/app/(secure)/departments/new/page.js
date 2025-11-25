"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDepartments } from "@/actions/departments/business";

export default function NewDepartmentPage() {
  const router = useRouter();
  const { createDepartment } = useDepartments();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setLoading(true);

    const result = await createDepartment({
      name: name.trim(),
      description: description.trim(),
    });

    setLoading(false);

    if (result.success) {
      router.push("/departments");
    } else {
      setError(result.error || "Failed to create department");
    }
  }

  function handleCancel() {
    router.push("/departments");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Add New Department
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Create a new department for your organization
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department description"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
