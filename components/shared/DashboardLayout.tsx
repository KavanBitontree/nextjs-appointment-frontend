"use client";

import React, { useState, useEffect } from "react";
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
  // Persist sidebar state across navigation
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarOpen");
      return saved === "true";
    }
    return true; // Default to open
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

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
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? "200px" : "70px" }}
      >
        {/* Top Navigation Bar */}
        <TopNavbar appName={appName} profileHref={profileHref} />

        {/* Page Content */}
        <main className="p-8 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
