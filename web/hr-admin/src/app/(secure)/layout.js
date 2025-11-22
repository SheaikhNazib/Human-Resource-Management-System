"use client";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function SecureLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header onOpen={() => setSidebarOpen(true)} />
        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
