"use client";
import React, { useState, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEmployees } from "@/actions/employees/business";

export default function EmployeesPage() {
    const { employees, loading, error, refetch, deleteEmployee } = useEmployees();
    const [query, setQuery] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const router = useRouter();


    function handleView(id) {
        setOpenMenuId(null);
        router.push(`/employees/${id}`);
    }

    function handleEdit(id) {
        setOpenMenuId(null);
        router.push(`/employees/${id}/edit`);
    }

    async function handleDelete(id) {
        setOpenMenuId(null);
        const ok = window.confirm("Delete this employee? This action cannot be undone.");
        if (!ok) return;
        
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

    return (
        <div className="max-w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Employees</h1>
                    <p className="text-sm text-zinc-500">All employees in the system</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search employees..."
                            className="w-64 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-4 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2 w-4 h-4 text-zinc-400" />
                    </div>
                    <button
                        onClick={refetch}
                        className="text-sm px-3 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        title="Reload from API"
                    >
                        Reload
                    </button>
                    <Link href="/employees/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        <Plus className="w-4 h-4" /> Add
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-zinc-500">
                                <th className="py-2 px-3 text-left font-normal">Name</th>
                                <th className="py-2 px-3 text-left font-normal">Email</th>
                                <th className="py-2 px-3 text-left font-normal">Role</th>
                                <th className="py-2 px-3 text-left font-normal">Department</th>
                                <th className="py-2 px-3 text-left font-normal">Status</th>
                                <th className="py-2 px-3 text-left font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                            {error && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-red-600">
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                                        No employees found.
                                    </td>
                                </tr>
                            )}

                            {filtered.map((emp, idx) => {
                                const id = emp.id ?? emp.raw?.id ?? `row-${idx}`;
                                const first = emp.firstName ?? emp.raw?.firstName ?? emp.raw?.first_name ?? emp.raw?.first ?? '';
                                const last = emp.lastName ?? emp.raw?.lastName ?? emp.raw?.last_name ?? emp.raw?.last ?? '';
                                const fullName = `${first} ${last}`.trim() || emp.name || emp.raw?.name || '—';
                                const email = emp.email ?? emp.raw?.email ?? emp.raw?.email_address ?? emp.raw?.emailAddress ?? '—';
                                const job = emp.jobTitle ?? emp.raw?.jobTitle ?? emp.raw?.job_title ?? emp.role ?? '—';
                                const dept = emp.department ?? emp.raw?.department ?? emp.raw?.dept ?? '—';
                                const status = emp.status ?? emp.raw?.status ?? 'Active';
                                const initials = (first?.[0] || fullName?.[0] || '').toUpperCase() + (last?.[0] || '').toUpperCase();

                                return (
                                    <tr key={id} className="border-t border-zinc-100 dark:border-zinc-800">
                                        <td className="py-3 px-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                {initials || '—'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{fullName}</div>
                                                <div className="text-xs text-zinc-500">{email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">{email}</td>
                                        <td className="py-3 px-3">{job}</td>
                                        <td className="py-3 px-3">{dept}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${status === "Active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 relative">
                                            <div className="flex items-center gap-2 justify-start">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === id ? null : id)}
                                                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    aria-haspopup="true"
                                                    aria-expanded={openMenuId === id}
                                                    aria-label="Actions"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            </div>

                                            {openMenuId === id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded shadow-lg border border-zinc-200 dark:border-zinc-800 z-50">
                                                    <button onClick={() => handleView(id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-zinc-500" /> View
                                                    </button>
                                                    <button onClick={() => handleEdit(id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                                                        <Edit className="w-4 h-4 text-zinc-500" /> Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600">
                                                        <Trash className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}