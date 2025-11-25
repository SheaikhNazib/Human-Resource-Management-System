"use client";
import { ChevronDown, Menu, Search } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import "../app/globals.css";
import Sidebar from "./Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-900 min-h-screen`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2 w-full">
                <button
                  className="lg:hidden p-1 mr-2"
                  onClick={() => setSidebarOpen(true)}
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
                {/* Dropdown menu (placeholder, implement logic as needed) */}
                {/*
                <div className="absolute right-0 mt-12 w-40 bg-white dark:bg-zinc-900 rounded shadow-lg py-2 z-50">
                  <a href="/profile" className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Profile</a>
                  <a href="/settings" className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</a>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">Logout</button>
                </div>
                */}
              </div>
            </header>
            {/* Content Area */}
            <main className="flex-1 p-4 lg:p-8 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
