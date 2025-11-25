"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEmployees } from "@/actions/employees/business";
import TableArchive from "@/components/core/TableArchive";

export default function EmployeesPage() {
    const { employees, loading, error, refetch, deleteEmployee } = useEmployees();
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleView(id) {
        router.push(`/employees/${id}/view`);
    }

    function handleEdit(id) {
        router.push(`/employees/${id}/edit`);
    }

    async function handleDelete(id) {
        const result = await deleteEmployee(id);
        if (!result.success) {
            alert(result.error || "Delete failed");
        }
    }

    const filtered = useMemo(() => {
        if (!query) return employees;
        const q = query.toLowerCase();
        return employees.filter(
            (e) =>
                (e.firstName || "").toLowerCase().includes(q) ||
                (e.lastName || "").toLowerCase().includes(q) ||
                (e.email || "").toLowerCase().includes(q) ||
                (e.jobTitle || "").toLowerCase().includes(q) ||
                (e.department || "").toLowerCase().includes(q)
        );
    }, [employees, query]);

    const columns = [
        {
            header: "Name",
            accessor: "firstName",
            render: (emp) => {
                const first = emp.firstName ?? emp.raw?.firstName ?? emp.raw?.first_name ?? emp.raw?.first ?? '';
                const last = emp.lastName ?? emp.raw?.lastName ?? emp.raw?.last_name ?? emp.raw?.last ?? '';
                const fullName = `${first} ${last}`.trim() || emp.name || emp.raw?.name || '—';
                const email = emp.email ?? emp.raw?.email ?? emp.raw?.email_address ?? emp.raw?.emailAddress ?? '—';
                const initials = (first?.[0] || fullName?.[0] || '').toUpperCase() + (last?.[0] || '').toUpperCase();
                const id = emp.id ?? emp.raw?.id ?? '';

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                            {initials || '—'}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => handleView(id)}
                                className="font-medium text-zinc-900 dark:text-zinc-100 text-left hover:underline focus:outline-none cursor-pointer"
                            >
                                {fullName}
                            </button>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Email",
            accessor: "email",
            render: (emp) => emp.email ?? emp.raw?.email ?? emp.raw?.email_address ?? emp.raw?.emailAddress ?? '—'
        },
        {
            header: "Role",
            accessor: "jobTitle",
            render: (emp) => emp.jobTitle ?? emp.raw?.jobTitle ?? emp.raw?.job_title ?? emp.role ?? '—'
        },
        {
            header: "Department",
            accessor: "department",
            render: (emp) => emp.department ?? emp.raw?.department ?? emp.raw?.dept ?? '—'
        },
        {
            header: "Status",
            accessor: "status",
            render: (emp) => {
                const status = emp.status ?? emp.raw?.status ?? 'Active';
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        status === "Active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"
                    }`}>
                        {status}
                    </span>
                );
            }
        }
    ];

    const renderActions = (emp) => {
        const id = emp.id ?? emp.raw?.id ?? '';
        
        return (
            <TableArchive.Actions
                row={emp}
                onView={() => handleView(id)}
                onEdit={() => handleEdit(id)}
                onDelete={() => handleDelete(id)}
                hasViewPermission={true}
                hasEditPermission={true}
                hasDeletePermission={true}
                deleteConfirmMessage="Delete this employee? This action cannot be undone."
            />
        );
    };

    return (
        <div className="max-w-full">
            <TableArchive
                title="Employees"
                columns={columns}
                data={filtered}
                loading={loading}
                error={error}
                emptyMessage="No employees found."
                searchTerm={query}
                onSearchChange={setQuery}
                searchPlaceholder="Search employees..."
                createButtonText="Add Employee"
                createButtonHref="/employees/new"
                onRefresh={refetch}
                showRefreshButton={true}
                actionsRender={renderActions}
                className="max-w-full"
            />
        </div>
    );
}