"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { LogOut, User, Calendar, FileText, Activity } from "lucide-react";
import { AuthGuard, useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout("/login");
  };

  return (
    <AuthGuard allowedRoles={["patient"]}>
      <div className="min-h-screen bg-white p-8 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Patient Dashboard
              </h1>
              <p className="text-slate-700">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Logout
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Appointments</p>
                  <p className="text-2xl font-bold text-slate-900">3</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Records</p>
                  <p className="text-2xl font-bold text-slate-900">12</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Health Score</p>
                  <p className="text-2xl font-bold text-slate-900">85%</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user?.email}
                </h2>
                <p className="text-slate-600">Patient Account</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">User ID</p>
                <p className="text-lg font-semibold text-slate-900">
                  {user?.user_id}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-emerald-700">
                  {user?.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              Single-Session Security
            </h3>
            <p className="text-slate-700 text-sm">
              {
                "You're securely logged in. Logging in from another device will automatically log you out here."
              }
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
