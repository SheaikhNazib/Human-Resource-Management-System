"use client";
import {
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
  DollarSign,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IdCardLanyard } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const pathname = usePathname();

  // Auto-open the parent menu if the current path matches one of its children
  useEffect(() => {
    if (!pathname) return;
    const newOpen = {};
    navLinks.forEach((item) => {
      if (item.children && item.children.some((c) => c.href === pathname)) {
        newOpen[item.label] = true;
      }
    });
    // Set only the matching parent menu open (ensure single-open behavior)
    setOpenMenus(newOpen);
  }, [pathname]);

  // Define all navigation links
  const allNavLinks = [
    // Employee Dashboard - only for employees
    {
      href: "/employee-dashboard",
      label: "My Dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["employee"],
    },
    
    // Admin Dashboard - for all except employees
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["super_admin", "admin", "accountant", "hr", "hr_manager", "manager"],
    },

    {
      label: "Employee Management",
      icon: IdCardLanyard,
      allowedRoles: ["super_admin", "admin", "hr", "hr_manager", "manager"],
      children: [
        { href: "/employees", label: "Employees", icon: Users },
        { href: "/attendance", label: "Attendance", icon: CalendarCheck },
        {
          href: "/attendance-records",
          label: "Attendance Records",
          icon: CalendarDays,
        },
        { href: "/leaves", label: "Leaves", icon: FileText },
        { href: "/performance", label: "Performance", icon: Wallet },
        {
          href: "/salary-compensations/salary-list",
          label: "Salary List",
          icon: CreditCard,
        },
      ],
    },

    // {
    //   label: "Salary Compensation",
    //   icon: DollarSign,
    //   children: [
    //     {
    //       href: "/salary-compensations/salary-list",
    //       label: "Salary List",
    //       icon: CreditCard,
    //     },
    //   ],
    // },

    {
      label: "Task Management",
      icon: Calendar,
      children: [
        {
          href: "/tasks/list",
          label: "Task List",
          icon: Calendar,
        },
        {
          href: "/tasks",
          label: "My Tasks",
          icon: Calendar,
        },
      ],
    },

    {
      href: "/departments",
      label: "Departments",
      icon: Building2,
    },

    // Admin access - only visible to super_admin
    ...(user?.role === "super_admin"
      ? [
          {
            label: "Admin access",
            icon: Wallet,
            allowedRoles: ["super_admin"],
            children: [
              {
                href: "/admin-access-management/add-user",
                label: "Add User",
                icon: Users,
              },
              {
                href: "/admin-access-management/user-role",
                label: "User Role",
                icon: Users,
              },
            ],
          },
        ]
      : []),
  ];

  // Filter navigation links based on user role
  const navLinks = allNavLinks.filter((item) => {
    if (!user?.role) return false;
    return item.allowedRoles?.includes(user.role) ?? true;
  });

  // Shared classes for consistency between top-level and nested items
  const baseItemClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400";
  const activeClass =
    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500 dark:border-blue-400";

  return (
    <aside
      className={`fixed z-30 inset-y-0 left-0 transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0`}
    >
      <Link href="/" className="flex items-center gap-2 mb-8 px-1 group">
        <div className="w-7 h-7 rounded bg-linear-to-br from-blue-600 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
          <div className="w-4 h-4 bg-white rounded shadow" />
        </div>
        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
          HRMS
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navLinks.map((item) => {
          const { href, label, icon: Icon, children } = item;
          const hasActiveChild = children
            ? children.some((c) => c.href === pathname)
            : false;

          if (children) {
            const isOpen = !!openMenus[label];
            const parentActive =
              (href && href === pathname) || (isOpen && hasActiveChild);
            return (
              <div key={label}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenus((s) => {
                      const currentlyOpen = !!s[label];
                      return currentlyOpen ? {} : { [label]: true };
                    })
                  }
                  className={`${baseItemClass} w-full justify-between ${
                    parentActive ? activeClass : ""
                  }`}
                  title={label}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        parentActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    />
                    <span className="text-sm flex-1 truncate">{label}</span>
                  </div>
                  <span
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  </span>
                </button>

                {isOpen && (
                  <div className="flex flex-col mt-1">
                    {children.map(
                      ({ href: chHref, label: chLabel, icon: ChIcon }) => (
                        <Link
                          key={chHref}
                          href={chHref}
                          className={`${baseItemClass} pl-10 ${
                            pathname === chHref ? activeClass : ""
                          }`}
                          title={chLabel}
                        >
                          <ChIcon
                            className={`w-4 h-4 ${
                              pathname === chHref
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          />
                          <span className="flex-1 truncate">{chLabel}</span>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={href ?? label}
              href={href}
              className={`${baseItemClass} ${
                pathname === href ? activeClass : ""
              }`}
              title={label}
            >
              <Icon
                className={`w-5 h-5 ${
                  pathname === href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* <div className="mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        {!collapsed && user && (
          <div className="flex flex-col items-center mb-4">
            <img
              src={user.avatar || "/avatar.png"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 mb-2"
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate max-w-full px-2">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.name || user.email || "User"}
            </span>
          </div>
        )}
        <button
          onClick={async () => {
            toast.loading("Logging out...");
            try {
              await logout();
              toast.dismiss();
              toast.success("Logged out successfully");
            } catch (error) {
              toast.dismiss();
              toast.error("Failed to logout");
            }
          }}
          className={`w-full flex items-center gap-2 text-left text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
        </button>
      </div> */}
    </aside>
  );
}
