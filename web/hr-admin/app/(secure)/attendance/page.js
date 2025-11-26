"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAttendances } from "@/actions/attendances/business";
import TableArchive from "@/components/core/TableArchive";

export default function AttendancePage() {
    const { attendances, loading, error, refetch, deleteAttendance } = useAttendances();
    const [query, setQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const router = useRouter();

    function handleView(id) {
        router.push(`/attendance/${id}/view`);
    }

    function handleEdit(id) {
        router.push(`/attendance/${id}/edit`);
    }

    async function handleDelete(id) {
        const result = await deleteAttendance(id);
        if (!result.success) {
            alert(result.error || "Delete failed");
        }
    }

    const filtered = useMemo(() => {
        const q = query ? query.toLowerCase() : "";

        // Helper to compare only the date portion (YYYY-MM-DD)
        const normalizeDate = (d) => {
            if (!d) return "";
            try {
                // If already in YYYY-MM-DD, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return "";
                return dt.toISOString().split("T")[0];
            } catch (e) {
                return "";
            }
        };

        return attendances.filter((a) => {
            const matchesQuery = !q || (
                (a.date || "").toString().toLowerCase().includes(q) ||
                (a.employeeName || "").toString().toLowerCase().includes(q) ||
                (a.remarks || "").toString().toLowerCase().includes(q)
            );

            const matchesDate = !selectedDate || normalizeDate(a.date) === selectedDate;

            return matchesQuery && matchesDate;
        });
    }, [attendances, query, selectedDate]);

    const columns = [
        {
            header: "Date",
            accessor: "date",
            render: (att) => att.date ?? att.raw?.date ?? '—'
        },
        {
            header: "Employee",
            accessor: "employeeName",
            render: (att) => att.employeeName ?? att.employee ?? att.raw?.employeeName ?? att.raw?.employee ?? '—'
        },
        {
            header: "Check In",
            accessor: "checkIn",
            render: (att) => att.checkIn ?? att.raw?.checkIn ?? '—'
        },
        {
            header: "Check Out",
            accessor: "checkOut",
            render: (att) => att.checkOut ?? att.raw?.checkOut ?? '—'
        },
        {
            header: "Location",
            accessor: "onsiteOrRemote",
            render: (att) => {
                const onsite = att.onsiteOrRemote ?? att.raw?.onsiteOrRemote ?? att.raw?.onsite_or_remote ?? true;
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        onsite ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                        {onsite ? "Onsite" : "Remote"}
                    </span>
                );
            }
        },
        {
            header: "Remarks",
            accessor: "remarks",
            render: (att) => {
                const remarks = att.remarks ?? att.raw?.remarks ?? '';
                return remarks ? (
                    <span className="text-sm text-gray-600">{remarks}</span>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                );
            }
        }
    ];

    const renderActions = (att) => {
        const id = att.id ?? att.raw?.id ?? '';
        
        return (
            <TableArchive.Actions
                row={att}
                onView={() => handleView(id)}
                onEdit={() => handleEdit(id)}
                onDelete={() => handleDelete(id)}
                hasViewPermission={true}
                hasEditPermission={true}
                hasDeletePermission={true}
                deleteConfirmMessage="Delete this attendance record? This action cannot be undone."
            />
        );
    };

    return (
        <div className="max-w-full">
            <TableArchive
                title="Attendance Records"
                columns={columns}
                data={filtered}
                loading={loading}
                error={error}
                emptyMessage="No attendance records found."
                searchTerm={query}
                onSearchChange={setQuery}
                searchPlaceholder="Search attendance..."
                headerExtras={
                    <div className="ml-2 flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-white"
                            aria-label="Filter by date"
                        />
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate("")}
                                className="text-sm text-zinc-500 hover:text-zinc-700"
                                aria-label="Clear date filter"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                }
                onRefresh={refetch}
                showRefreshButton={true}
                actionsRender={renderActions}
                className="max-w-full"
            />
        </div>
    );
}
