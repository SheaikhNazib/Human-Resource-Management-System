"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePerformance } from "@/actions/performance";
import TableArchive from "@/components/core/TableArchive";

export default function PerformancePage() {
  const { performances, loading, error, refetch, deletePerformance } =
    usePerformance();
  const [query, setQuery] = useState("");
  // Pagination state (client-side)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
      const emp = p.employee || p.raw?.employee || {};
      const name = (
        p.employeeName ||
        emp.name ||
        `${emp.first_name || ""} ${emp.last_name || ""}` ||
        ""
      )
        .toString()
        .toLowerCase();
      const notes = (p.feedback || p.notes || "").toString().toLowerCase();
      const score = (p.score ?? p.rating ?? p.raw?.score ?? "").toString();
      return name.includes(q) || notes.includes(q) || score.includes(q);
    });
  }, [performances, query]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalItems = filtered.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const columns = [
    {
      header: "Employee",
      accessor: "employee",
      render: (row) => {
        const emp = row.employee || row.raw?.employee || {};
        const name =
          row.employeeName ||
          emp.name ||
          `${emp.first_name || ""} ${emp.last_name || ""}` ||
          "—";
        const id = row.employeeId ?? emp.id ?? row.raw?.employeeId ?? "";

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
              {name?.[0]?.toUpperCase() || "—"}
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleView(row.id ?? row.raw?.id)}
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
      accessor: "score",
      render: (row) => {
        const s = row.score ?? row.rating ?? row.raw?.score ?? 0;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded text-white text-xs ${
                s <= 3
                  ? "bg-red-500"
                  : s <= 6
                  ? "bg-yellow-400 text-black"
                  : s <= 8
                  ? "bg-amber-400 text-black"
                  : "bg-green-500"
              }`}
            >
              {s}
            </span>
            <div className="text-xs text-zinc-500">
              {s <= 3
                ? "Poor"
                : s <= 6
                ? "Fair"
                : s <= 8
                ? "Good"
                : "Excellent"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Review Date",
      accessor: "review_date",
      render: (row) => {
        const date = row.review_date ?? row.raw?.review_date ?? row.createdAt;
        return (
          <div className="text-sm text-zinc-700 dark:text-zinc-200">
            {date ? new Date(date).toLocaleDateString() : "—"}
          </div>
        );
      },
    },
    {
      header: "Notes",
      accessor: "feedback",
      render: (row) => (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
          {row.feedback || row.notes || "—"}
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
        data={paginated}
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
        pagination={{ total: totalItems, skip: (page - 1) * limit, limit }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
