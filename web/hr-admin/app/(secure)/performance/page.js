"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/actions/performance";
import TableArchive from "@/components/core/TableArchive";

export default function PerformancePage() {
  const { performances, loading, error, refetch, deletePerformance } =
    usePerformance();
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleView(id) {
    router.push(`/performance/${id}/view`);
  }

  function handleEdit(id) {
    router.push(`/performance/${id}/edit`);
  }

  async function handleDelete(id) {
    const result = await deletePerformance(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    if (!query) return performances;
    const q = query.toLowerCase();
    return performances.filter((p) => {
      const name = (p.employeeName || p.raw?.employee?.name || "")
        .toString()
        .toLowerCase();
      const notes = (p.notes || "").toString().toLowerCase();
      const score = (p.rating || p.raw?.score || "").toString();
      return name.includes(q) || notes.includes(q) || score.includes(q);
    });
  }, [performances, query]);

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (row) => {
        const name = row.employeeName || row.raw?.employee?.name || "—";
        const id = row.employeeId ?? row.raw?.employee?.id ?? "";

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              {name?.[0]?.toUpperCase() || "—"}
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleView(row.id)}
                className="font-medium text-zinc-900 dark:text-zinc-100 text-left hover:underline focus:outline-none cursor-pointer"
              >
                {name}
              </button>
              <div className="text-xs text-zinc-500">ID: {id || "—"}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Score",
      accessor: "rating",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-0.5 rounded text-white text-xs ${
              row.rating <= 3
                ? "bg-red-500"
                : row.rating <= 6
                ? "bg-yellow-400 text-black"
                : row.rating <= 8
                ? "bg-amber-400 text-black"
                : "bg-green-500"
            }`}
          >
            {row.rating}
          </span>
          <div className="text-xs text-zinc-500">
            {row.rating <= 3
              ? "Poor"
              : row.rating <= 6
              ? "Fair"
              : row.rating <= 8
              ? "Good"
              : "Excellent"}
          </div>
        </div>
      ),
    },
    {
      header: "Review Date",
      accessor: "createdAt",
      render: (row) => {
        const date = row.raw?.review_date ?? row.createdAt;
        return (
          <div className="text-sm text-zinc-700 dark:text-zinc-200">
            {date ? new Date(date).toLocaleDateString() : "—"}
          </div>
        );
      },
    },
    {
      header: "Notes",
      accessor: "notes",
      render: (row) => (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
          {row.notes || "—"}
        </div>
      ),
    },
  ];

  const renderActions = (row) => {
    const id = row.id ?? row.raw?.id ?? "";

    return (
      <TableArchive.Actions
        row={row}
        onView={() => handleView(id)}
        onEdit={() => handleEdit(id)}
        onDelete={() => handleDelete(id)}
        hasViewPermission={true}
        hasEditPermission={true}
        hasDeletePermission={true}
        deleteConfirmMessage="Delete this performance record? This action cannot be undone."
      />
    );
  };

  return (
    <div className="max-w-full">
      <TableArchive
        title="Employee Performance"
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No performance records found."
        searchTerm={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search performances..."
        createButtonText="Add Performance"
        createButtonHref="/performance/new"
        onRefresh={refetch}
        showRefreshButton={true}
        actionsRender={renderActions}
        className="max-w-full"
      />
    </div>
  );
}
