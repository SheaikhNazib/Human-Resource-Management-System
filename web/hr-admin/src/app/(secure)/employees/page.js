// Easy to override API endpoint. Set NEXT_PUBLIC_API_URL in .env.local
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Easy to override API endpoint. Set NEXT_PUBLIC_API_URL in .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/employees";

// Placeholder data lifted outside component to avoid hook dependency warnings
const PLACEHOLDER = [
    {
        id: "1",
        name: "Leasie Watson",
        email: "leasie.w@example.com",
        role: "Team Lead - Design",
        department: "Design",
        status: "Active",
        avatar: "/avatar1.png",
    },
    {
        id: "2",
        name: "Darlene Robertson",
        email: "darlene.r@example.com",
        role: "Web Designer",
        department: "Design",
        status: "Active",
        avatar: "/avatar2.png",
    },
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Load placeholder immediately, then try to fetch real data
        setEmployees(PLACEHOLDER);
    }, []);

    async function fetchEmployees() {
        setLoading(true);
        setError(null);
        try {
            // Replace API_URL with your real endpoint returning JSON array of employees
            const res = await fetch(API_URL, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();
            // Expecting data to be an array of employee objects
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    // Expose a simple manual reload trigger from the UI
    function handleReload() {
        fetchEmployees();
    }

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
        try {
            setLoading(true);
            setError(null);
            const base = String(API_URL).replace(/\/$/, "");
            const res = await fetch(`${base}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            // remove locally
            setEmployees((prev) => prev.filter((e) => String(e.id) !== String(id)));
        } catch (err) {
            setError(err.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        if (!query) return employees;
        const q = query.toLowerCase();
        return employees.filter(
            (e) =>
                (e.name || "").toLowerCase().includes(q) ||
                (e.email || "").toLowerCase().includes(q) ||
                (e.role || "").toLowerCase().includes(q) ||
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
                        onClick={handleReload}
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

                            {filtered.map((emp) => (
                                <tr key={emp.id} className="border-t border-zinc-100 dark:border-zinc-800">
                                    <td className="py-3 px-3 flex items-center gap-3">
                                        <Image src={emp.avatar || "/avatar.png"} width={32} height={32} className="rounded-full" alt={emp.name} />
                                        <div>
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</div>
                                            <div className="text-xs text-zinc-500">{emp.email}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">{emp.email}</td>
                                    <td className="py-3 px-3">{emp.role}</td>
                                    <td className="py-3 px-3">{emp.department}</td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 relative">
                                        <div className="flex items-center gap-2 justify-start">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                aria-haspopup="true"
                                                aria-expanded={openMenuId === emp.id}
                                                aria-label="Actions"
                                            >
                                                <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                            </button>
                                        </div>

                                        {openMenuId === emp.id && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded shadow-lg border border-zinc-200 dark:border-zinc-800 z-50">
                                                <button onClick={() => handleView(emp.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                                                    <Eye className="w-4 h-4 text-zinc-500" /> View
                                                </button>
                                                <button onClick={() => handleEdit(emp.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                                                    <Edit className="w-4 h-4 text-zinc-500" /> Edit
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600">
                                                    <Trash className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}