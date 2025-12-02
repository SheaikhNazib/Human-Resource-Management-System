"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, LogOut, User } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";

export default function Header({ onOpen }) {
  const { user, logout } = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    setShowDropdown(false); // Close dropdown immediately
    toast.loading("Logging out...");
    try {
      await logout();
      toast.dismiss();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to logout");
    }
  };
  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 w-full">
        {/* Only show menu button if onOpen is provided (not for employees) */}
        {onOpen && (
          <button
            className="lg:hidden p-1 mr-2"
            onClick={onOpen}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-200" />
          </button>
        )}

        {/* Search bar */}
        <div className="flex-1 flex justify-center"></div>
      </div>
      {/* User area */}
      <div className="flex items-center gap-2 relative">
        <div className="mr-2">
          <ThemeToggle />
        </div>
        {user ? (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                {user.email || user.work_email || user.personal_email || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name)}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.name || (user.role ? user.role.replace('_', ' ') : 'User')}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 group"
              >
                <img
                  src={user.avatar || "/avatar.png"}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0 object-cover"
                />
                <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-40">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user.email || user.work_email || user.personal_email || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name || "User")}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.name || (user.role ? user.role.replace('_', ' ') : '')}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="text-lg bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
