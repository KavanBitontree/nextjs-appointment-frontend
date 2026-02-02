"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
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
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 200 : 70 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-slate-900 text-white flex flex-col fixed left-0 top-0 h-full z-40 border-r border-slate-800"
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <motion.div
          animate={{ width: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <div className="text-sm font-bold">{appName}</div>
        </motion.div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-2">
        {navItems?.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center ${
                isOpen ? "justify-start gap-3 px-3" : "justify-center px-0"
              } py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {item.icon}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isOpen
                    ? "opacity-100 max-w-full overflow-visible"
                    : "opacity-0 max-w-0 overflow-hidden w-0"
                }`}
                style={{
                  display: isOpen ? "inline-block" : "none",
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
