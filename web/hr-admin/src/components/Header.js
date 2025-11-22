"use client";
import { ChevronDown, Menu, Search } from "lucide-react";

export default function Header({ onOpen }) {
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
        <span className="text-lg font-medium text-zinc-800 dark:text-zinc-100 hidden md:block">
          Welcome, Admin
        </span>
        {/* Search bar */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-4 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1.5 w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
      {/* User dropdown */}
      <div className="flex items-center gap-2 relative">
        <span className="text-zinc-500 dark:text-zinc-400 text-sm hidden sm:block">
          admin@company.com
        </span>
        <button className="flex items-center gap-1 group">
          <img
            src="/avatar.png"
            alt="Admin Avatar"
            className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700"
          />
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
        </button>
      </div>
    </header>
  );
}
