"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLeaves } from "@/actions/leaves/business";
import TableArchive from "@/components/core/TableArchive";
import LeaveStatusDropdown from "@/components/LeaveStatusDropdown";

export default function LeavesPage() {
  const { leaves, loading, error, refetch, deleteLeave, updateLeaveStatus } = useLeaves();
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleView(id) {
    router.push(`/leaves/view/${id}`);
  }

  async function handleDelete(id) {
    const result = await deleteLeave(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
  }

  async function handleStatusChange(leaveId, newStatus) {
    const result = await updateLeaveStatus(leaveId, newStatus, "Admin"); // Replace "Admin" with actual user ID/name
    if (!result.success) {
      alert(result.error || "Failed to update status");
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
      render: (leave) => {
        const firstName = leave.raw?.employee?.first_name || '';
        const lastName = leave.raw?.employee?.last_name || '';
        const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || leave.employeeName || '—';
        
        return (
          <div className="font-medium text-zinc-900 dark:text-zinc-100">
            {displayName}
          </div>
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
      header: "Leave Type",
      accessor: "leaveType",
      render: (leave) => {
        const reason = leave.reason || leave.raw?.reason || "";
        let type = "Casual";
        let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
        
        if (reason.startsWith("Sick Leave")) {
          type = "Sick";
          colorClass = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
        } else if (reason.startsWith("Annual Leave")) {
          type = "Annual";
          colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
        } else if (reason.startsWith("Casual Leave")) {
          type = "Casual";
        }
        
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
            {type}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (leave) => {
        const status = leave.status || leave.raw?.status || "pending";
        return (
          <LeaveStatusDropdown
            currentStatus={status}
            onStatusChange={handleStatusChange}
            leaveId={leave.id}
          />
        );
      },
    },
    {
      header: "Notes",
      accessor: "reason",
      render: (leave) => {
        const reason = leave.reason || leave.raw?.reason || "";
        // Extract notes part after leave type prefix
        let displayText = reason;
        if (reason.startsWith("Casual Leave") || reason.startsWith("Sick Leave") || reason.startsWith("Annual Leave")) {
          displayText = reason.replace(/^(Casual|Sick|Annual) Leave[\s-]*/, "").trim();
        }
        
        return (
          <div className="text-sm text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
            {displayText || "—"}
          </div>
        );
      },
    },
  ];

  const renderActions = (leave) => {
    const id = leave.id ?? leave.raw?.id ?? "";

    return (
      <TableArchive.Actions
        row={leave}
        onView={() => handleView(id)}
        onDelete={() => handleDelete(id)}
        hasViewPermission={true}
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
