"use client";
import React, { useMemo, useState } from "react";
import TableArchive from "@/components/core/TableArchive";
import { useTasks } from "@/actions/tasks/business";
import { useRouter } from "next/navigation";

export default function TasksListPage() {
  const { tasks, loading, error, refetch, deleteTask } = useTasks();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.estimated_time || "").toLowerCase().includes(q)
    );
  }, [tasks, query]);

  function handleView(id) {
    router.push(`/tasks/${id}/view`);
  }

  function handleEdit(id) {
    router.push(`/tasks/${id}/edit`);
  }

  async function handleDelete(id) {
    const result = await deleteTask(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
  }

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (t) => <div className="font-medium text-zinc-900 dark:text-zinc-100">{t.title || t.raw?.title || '—'}</div>
    },
    {
      header: "Description",
      accessor: "description",
      render: (t) => <div className="text-sm text-zinc-600 truncate max-w-xl">{t.description || t.raw?.description || '—'}</div>
    },
    {
      header: "Start",
      accessor: "start_date_time",
      render: (t) => t.start_date_time || '—'
    },
    {
      header: "End",
      accessor: "end_date_time",
      render: (t) => t.end_date_time || '—'
    },
    {
      header: "Est. Time",
      accessor: "estimated_time",
      render: (t) => t.estimated_time || '—'
    },
    {
      header: "Assigned",
      accessor: "assigned_employees",
      render: (t) => Array.isArray(t.assigned_employees) ? `${t.assigned_employees.length} assigned` : '0'
    },
    {
      header: "Status",
      accessor: "task_status",
      render: (t) => {
        let s = t.task_status ?? t.raw?.task_status ?? t.raw?.status ?? 0;

        // If backend returned an object like { id: 2, name: 'In Progress' }
        if (typeof s === 'object' && s !== null) {
          s = s.id ?? s.value ?? 0;
        }

        // Coerce strings/numeric-like values to number where possible
        const sNum = Number.isFinite(Number(s)) ? Number(s) : 0;

        const label = sNum === 1 ? 'Open' : sNum === 2 ? 'In Progress' : sNum === 3 ? 'Done' : 'Unknown';
        const cls = sNum === 3 ? 'bg-green-100 text-green-700' : sNum === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100 text-zinc-700';
        return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{label}</span>;
      }
    }
  ];

  const renderActions = (t) => {
    const id = t.id ?? t.raw?.id ?? '';
    return (
      <TableArchive.Actions
        row={t}
        onView={() => handleView(id)}
        onEdit={() => handleEdit(id)}
        onDelete={() => handleDelete(id)}
        hasViewPermission={true}
        hasEditPermission={true}
        hasDeletePermission={true}
        deleteConfirmMessage="Delete this task? This action cannot be undone."
      />
    );
  };

  return (
    <div className="max-w-full">
      <TableArchive
        title="Tasks"
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No tasks found."
        searchTerm={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search tasks..."
        createButtonText="Add Task"
        createButtonHref="/tasks/new"
        onRefresh={refetch}
        showRefreshButton={true}
        actionsRender={renderActions}
        className="max-w-full"
      />
    </div>
  );
}
