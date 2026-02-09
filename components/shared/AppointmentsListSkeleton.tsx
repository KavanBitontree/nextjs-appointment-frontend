"use client";

import React from "react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200/60 ${className}`} />
  );
}

export function AppointmentsListSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Appointments Cards */}
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
  );
}

export default AppointmentsListSkeleton;
