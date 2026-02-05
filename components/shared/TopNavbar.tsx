"use client";

import React, { useRef, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, LogOut, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useState } from "react";

interface TopNavbarProps {
  appName?: string;
  profileHref?: string;
  showProfileDropdown?: boolean;
}

function TopNavbar({
  appName = "Aarogya ABS",
  profileHref = "/patient/profile",
  showProfileDropdown = true,
}: TopNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="h-16 flex items-center justify-between px-8">
        <div className="text-xl font-bold text-slate-900">{appName}</div>

        {/* Right side - Profile Dropdown */}
        {showProfileDropdown && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle profile menu"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-700" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {user?.role ? `${user.role[0].toUpperCase()}${user.role.slice(1)}` : "User"}{" "}
                      Account
                    </p>
                  </div>

                  <div className="p-2">
                    <Link href={profileHref}>
                      <motion.button
                        whileHover={{ backgroundColor: "#f1f5f9" }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={!isLoggingOut ? { backgroundColor: "#f1f5f9" } : {}}
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TopNavbar);
