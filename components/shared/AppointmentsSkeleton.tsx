"use client";

import React from "react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200/60 ${className}`} />
  );
}

export function AppointmentsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 sm:h-9 md:h-10 w-64 sm:w-80 mb-3" />
        <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Appointments Cards */}
      <div className="space-y-4 md:space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={`appointment-${i}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 sm:p-6 space-y-4">
              {/* Top Section - Doctor Name and Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
                  <Skeleton className="h-4 w-32 sm:w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full self-start" />
              </div>

              {/* Info Grid - Date, Time, Fees, Location */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={`info-${j}`} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 sm:h-6 w-24 sm:w-28" />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Patient Contact / Status Info Section */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 sm:flex-none sm:w-32 rounded-lg" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-200">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8 md:mt-10">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-12 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export default AppointmentsSkeleton;
