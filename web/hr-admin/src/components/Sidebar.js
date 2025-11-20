"use client";
import {
  Building2,
  Calendar,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  // Set currentPath only on client to avoid hydration mismatch
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "All Employees", icon: Users },
    { href: "/departments", label: "All Departments", icon: Building2 },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/payroll", label: "Payroll", icon: Wallet },
    { href: "/leaves", label: "Leaves", icon: FileText },
    { href: "/holidays", label: "Holidays", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside
      className={`fixed z-30 inset-y-0 left-0 transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 lg:static lg:translate-x-0`}
    >
      <Link href="/" className="flex items-center gap-2 mb-8 px-1 group">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="w-4 h-4 bg-white rounded shadow" />
        </div>
        <span className="font-bold text-lg tracking-tight text-zinc-900 group-hover:text-blue-700">
          HRMS
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-zinc-700 hover:bg-blue-50 hover:text-blue-700 ${
              currentPath === href
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                : ""
            }`}
            title={label}
          >
            <Icon
              className={`w-5 h-5 ${
                currentPath === href ? "text-blue-600" : "text-zinc-400"
              }`}
            />
            {label}
          </a>
        ))}
      </nav>
      <div className="mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        {/* Profile section */}
        {!collapsed && (
          <div className="flex flex-col items-center mb-4">
            <img
              src="/avatar.png"
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 mb-2"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-300">
              Admin
            </span>
          </div>
        )}
        <button
          className={`w-full flex items-center gap-2 text-left text-zinc-500 hover:text-red-500 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
          {/* Optionally add a profile/logout section here if needed */}
        </button>
      </div>
    </aside>
  );
}
