"use client";
import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";

export default function Header({ onOpen, user = null }) {
  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 w-full">
        <button
          className="lg:hidden p-1 mr-2"
          onClick={onOpen}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-200" />
        </button>

        {/* Search bar */}
        <div className="flex-1 flex justify-center">

        </div>
      </div>
      {/* User area */}
      <div className="flex items-center gap-2 relative">
        {user ? (
          <>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm hidden sm:block">
              {user.email}
            </span>
            <button className="flex items-center gap-1 group">
              <img
                src={user.avatar || "/avatar.png"}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700"
              />
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
            </button>
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
