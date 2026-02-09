"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import NotificationBadge, { BadgeColor } from "./NotificationBadge";

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  notificationStatus?: BadgeColor; // NEW: Add notification support
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems?: NavItem[];
  appName?: string;
}

export default function Sidebar({
  isOpen,
  onToggle,
  navItems,
  appName = "Aarogya ABS",
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-slate-900 text-white flex flex-col fixed left-0 top-0 h-screen z-40 border-r border-slate-800 overflow-hidden"
      >
        {/* Logo Section - Always has fixed height for icon area */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 h-16">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <div className="text-xs sm:text-sm font-bold leading-tight">
              {appName}
            </div>
          </motion.div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items - Icons always visible */}
        <nav className="flex-1 py-3 sm:py-4 px-2 sm:px-3 space-y-2 overflow-y-auto">
          {navItems?.map((item) => {
            const hasNotification = item.notificationStatus && item.notificationStatus !== "none";
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(226, 232, 240, 0.1)" }}
                  className={`flex items-center gap-3 py-2.5 sm:py-3 px-2 sm:px-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isActive(item.href)
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-white hover:bg-slate-800"
                  }`}
                >
                  {/* Icon - Always visible and properly sized with notification badge */}
                  <div className="flex-shrink-0 w-6 h-6 sm:w-6 sm:h-6 flex items-center justify-center relative" style={{ overflow: "visible" }}>
                    {item.icon}
                    {/* Notification Badge */}
                    {hasNotification && (
                      <NotificationBadge
                        status={item.notificationStatus as BadgeColor}
                        position="top-right"
                        size="sm"
                        key={`badge-${item.href}-${item.notificationStatus}`}
                      />
                    )}
                  </div>
                {/* Text - Hidden when collapsed, smooth animation */}
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs sm:text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
          })}
        </nav>
      </motion.div>

      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
