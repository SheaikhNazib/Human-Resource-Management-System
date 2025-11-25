"use client";
import React, { useEffect, useState } from "react";

export default function DepartmentForm({
  initialData = null,
  onSave,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData]);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-md z-10"
      >
        <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100 mb-4">
          {initialData ? "Edit Department" : "Add Department"}
        </h3>
        <div className="mb-3">
          <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">
            Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded border px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded border px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-500 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
