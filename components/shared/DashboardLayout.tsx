"use client";

import React, { useState } from "react";
import Sidebar, { type NavItem } from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  appName?: string;
  profileHref?: string;
}

export default function DashboardLayout({
  children,
  navItems = [],
  appName = "Aarogya ABS",
  profileHref = "/patient/profile",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        navItems={navItems}
        appName={appName}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-[100px]"
        }`}
      >
        {/* Top Navigation Bar */}
        <TopNavbar appName={appName} profileHref={profileHref} />

        {/* Page Content */}
        <main className="p-8 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
