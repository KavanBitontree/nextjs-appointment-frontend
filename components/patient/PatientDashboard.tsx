"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-700">
            Welcome back! Here's an overview of your tasks and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-slate-900">3</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Medical Records</p>
                <p className="text-3xl font-bold text-slate-900">12</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Health Score</p>
                <p className="text-3xl font-bold text-green-600">85%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Account Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Email</p>
              <p className="text-lg font-semibold text-slate-900">
                {user?.email}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Status</p>
              <p className="text-lg font-semibold text-green-600">
                {user?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
