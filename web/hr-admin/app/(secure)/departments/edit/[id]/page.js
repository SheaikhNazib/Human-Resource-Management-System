"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDepartments } from "@/actions/departments/business";
import { getDepartment } from "@/actions/departments/server-actions";

export default function EditDepartmentPage({ params }) {
  const router = useRouter();
  const { updateDepartment } = useDepartments();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);

  useEffect(() => {
    async function loadDepartment() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (!id) {
          setError("Department ID not found");
          setLoading(false);
          return;
        }

        setDepartmentId(id);
        const result = await getDepartment(id);

        if (result.success) {
          setName(result.data.name || "");
          setDescription(result.data.description || "");
        } else {
          setError(result.error || "Failed to load department");
        }
      } catch (err) {
        setError(err.message || "Failed to load department");
      } finally {
        setLoading(false);
      }
    }

    loadDepartment();
  }, [params]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !departmentId) return;

    setError(null);
    setSaving(true);

    const result = await updateDepartment(departmentId, {
      name: name.trim(),
      description: description.trim(),
    });

    setSaving(false);

    if (result.success) {
      router.push("/departments");
    } else {
      setError(result.error || "Failed to update department");
    }
  }

  function handleCancel() {
    router.push("/departments");
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            Loading department...
          </p>
        </div>
      </div>
    );
  }

  if (error && !departmentId) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Edit Department
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Update department information
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
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
