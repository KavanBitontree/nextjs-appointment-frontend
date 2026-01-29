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
      animate={{ width: isOpen ? 240 : 100 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col fixed left-0 top-0 h-full z-40 border-r border-blue-800"
    >
      {/* Logo */}
      <div className="p-4 border-b border-blue-500 flex items-center justify-between">
        <motion.div
          animate={{ width: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <div className="text-sm font-bold">{appName}</div>
        </motion.div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-2">
        {navItems?.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-white hover:bg-blue-500"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.icon}
              <motion.span
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium overflow-hidden"
              >
                {item.label}
              </motion.span>
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
