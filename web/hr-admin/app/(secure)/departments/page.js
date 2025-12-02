"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import TableArchive from "../../../components/core/TableArchive";
import { useDepartments } from "@/actions/departments/business";
import Link from "next/link";

export default function Page() {
  const [query, setQuery] = useState("");

  // Pagination state (client-side)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const router = useRouter();
  const { departments, loading, error, refetch, deleteDepartment } =
    useDepartments();

  function handleEdit(d) {
    router.push(`/departments/edit/${d.id}`);
  }

  function handleView(id) {
    try {
      router.push(`/departments/view/${id}`);
    } catch (e) {
      console.warn("Navigation failed", e);
    }
  }

  async function handleDelete(id) {
    // Use the component's delete confirmation dialog instead of browser confirm()
    const result = await deleteDepartment(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    if (!query) return departments;
    const q = query.toLowerCase();
    return departments.filter(
      (d) =>
        (d.name || "").toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q)
    );
  }, [departments, query]);

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
      header: "Name",
      accessor: "name",
      render: (d) => (
        <Link
          href={`/departments/view/${d.id}`}
          className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
        >
          {d.name || "—"}
        </Link>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (d) => (
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          {d.description || "—"}
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (d) =>
        d.createdAt ? new Date(d.createdAt).toLocaleString() : "-",
    },
  ];

  return (
    <div className="max-w-full">
      <TableArchive
        title="Departments"
        columns={columns}
        data={paginated}
        loading={loading}
        error={error}
        emptyMessage="No departments found."
        searchTerm={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search departments..."
        createButtonText="Add Department"
        createButtonHref="/departments/new"
        onRefresh={refetch}
        showRefreshButton={true}
        actionsRender={(d) => (
          <TableArchive.Actions
            row={d}
            onView={() => handleView(d.id)}
            onEdit={() => handleEdit(d)}
            onDelete={() => handleDelete(d.id)}
            hasViewPermission={true}
            hasEditPermission={true}
            hasDeletePermission={true}
            deleteConfirmMessage="Delete this department? This action cannot be undone."
          />
        )}
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
