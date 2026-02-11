"use client";

import { motion } from "framer-motion";
import { Calendar, FileText } from "lucide-react";

export default function PatientDashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 md:h-12 bg-slate-200 rounded-lg w-48 mb-2" />
        <div className="h-4 sm:h-5 bg-slate-200 rounded-lg w-96 max-w-full" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
        {/* Upcoming Appointments Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
              <div className="h-9 bg-slate-200 rounded w-12" />
            </div>
          </div>
        </div>

        {/* Total Appointments Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-36 mb-2" />
              <div className="h-9 bg-slate-200 rounded w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Information Skeleton */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="h-7 bg-slate-200 rounded-lg w-48 mb-4" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-6 bg-slate-200 rounded w-48" />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="h-4 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-6 bg-slate-200 rounded w-20" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
