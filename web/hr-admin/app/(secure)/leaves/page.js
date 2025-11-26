"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLeaves } from "@/actions/leaves/business";
import TableArchive from "@/components/core/TableArchive";

export default function LeavesPage() {
  const { leaves, loading, error, refetch, deleteLeave } = useLeaves();
  const [query, setQuery] = useState("");
  const router = useRouter();

  async function handleDelete(id) {
    const result = await deleteLeave(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    if (!query) return leaves;
    const q = query.toLowerCase();
    return leaves.filter(
      (leave) =>
        (leave.employeeName || "").toLowerCase().includes(q) ||
        (leave.leaveType || "").toLowerCase().includes(q) ||
        (leave.status || "").toLowerCase().includes(q) ||
        (leave.reason || "").toLowerCase().includes(q)
    );
  }, [leaves, query]);

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (leave) => (
        <div className="font-medium text-zinc-900 dark:text-zinc-100">
          {leave.employeeName || leave.raw?.employee?.name || "—"}
        </div>
      ),
    },
    {
      header: "Leave Type",
      accessor: "leaveType",
      render: (leave) => {
        const type = leave.leaveType || leave.raw?.leave_type || "—";
        const typeColors = {
          sick: "bg-red-100 text-red-700",
          vacation: "bg-blue-100 text-blue-700",
          personal: "bg-purple-100 text-purple-700",
          casual: "bg-green-100 text-green-700",
          annual: "bg-indigo-100 text-indigo-700",
        };
        const colorClass = typeColors[type.toLowerCase()] || "bg-gray-100 text-gray-700";
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        );
      },
    },
    {
      header: "Start Date",
      accessor: "startDate",
      render: (leave) => {
        const date = leave.startDate || leave.raw?.start_date;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
    },
    {
      header: "End Date",
      accessor: "endDate",
      render: (leave) => {
        const date = leave.endDate || leave.raw?.end_date;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
    },
    {
      header: "Duration",
      accessor: "duration",
      render: (leave) => {
        const start = leave.startDate || leave.raw?.start_date;
        const end = leave.endDate || leave.raw?.end_date;
        if (!start || !end) return "—";
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (leave) => {
        const status = leave.status || leave.raw?.status || "pending";
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-700",
          approved: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
          cancelled: "bg-gray-100 text-gray-700",
        };
        const colorClass = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700";
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      header: "Reason",
      accessor: "reason",
      render: (leave) => (
        <div className="text-sm text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
          {leave.reason || leave.raw?.reason || "—"}
        </div>
      ),
    },
  ];

  const renderActions = (leave) => {
    const id = leave.id ?? leave.raw?.id ?? "";

    return (
      <TableArchive.Actions
        row={leave}
        onDelete={() => handleDelete(id)}
        hasViewPermission={false}
        hasEditPermission={false}
        hasDeletePermission={true}
        deleteConfirmMessage="Delete this leave request? This action cannot be undone."
      />
    );
  };

  return (
    <div className="max-w-full">
      <TableArchive
        title="Employee Leaves"
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No leave requests found."
        searchTerm={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search leaves..."
        createButtonText="Add Leave Request"
        createButtonHref="/leaves/new"
        onRefresh={refetch}
        showRefreshButton={true}
        actionsRender={renderActions}
        className="max-w-full"
      />
    </div>
  );
}
