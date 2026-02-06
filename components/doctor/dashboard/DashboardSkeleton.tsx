// components/doctor/dashboard/DashboardSkeleton.tsx
"use client";

import React from "react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200/60 ${className}`} />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 sm:h-9 md:h-10 w-64 sm:w-80 mb-3" />
        <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
      </div>

      {/* Quick Stats Cards - 4 columns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`stat-${i}`}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-8 md:h-9 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-6 mb-4 md:mb-6">
          <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
          <Skeleton className="h-9 w-full sm:w-48 rounded-lg" />
        </div>

        {/* Summary Cards - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={`revenue-summary-${i}`}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-24 mb-1" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-80 sm:h-96 md:h-[28rem]">
          <div className="h-full flex items-end justify-between gap-2 px-4">
            {[
              { height: "h-36" },
              { height: "h-56" },
              { height: "h-40" },
              { height: "h-68" },
              { height: "h-48" },
              { height: "h-60" },
              { height: "h-44" },
              { height: "h-52" },
            ].map((bar, i) => (
              <div
                key={`revenue-bar-${i}`}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <Skeleton className={`w-full rounded-t-lg ${bar.height}`} />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout - Appointment Status & Leave Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Appointment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
            <Skeleton className="h-9 w-full sm:w-40 rounded-lg" />
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 md:p-6 text-center mb-4 md:mb-6">
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-10 md:h-12 w-20 mx-auto" />
          </div>

          {/* Pie Chart */}
          <div className="flex items-center justify-center h-72 sm:h-80 md:h-96 mb-4 md:mb-6">
            <Skeleton className="h-48 sm:h-56 md:h-64 w-48 sm:w-56 md:w-64 rounded-full" />
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={`status-card-${i}`}
                className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 md:h-8 w-12 mb-2" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Leave Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-56 mb-4 md:mb-6" />

          {/* Stats Cards - 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={`leave-stat-${i}`}
                className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-3 md:p-4 text-center"
              >
                <Skeleton className="h-3 w-16 mx-auto mb-2" />
                <Skeleton className="h-7 md:h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            ))}
          </div>

          {/* Calendar Grid - 7 columns for days */}
          <div>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <Skeleton key={`day-label-${i}`} className="h-6 w-full" />
              ))}
            </div>
            {/* Calendar dates - 5 rows */}
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={`calendar-row-${row}`}
                className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                  <Skeleton
                    key={`calendar-${row}-${col}`}
                    className="h-10 sm:h-12 md:h-14 w-full rounded-lg"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slot Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
        <Skeleton className="h-6 sm:h-7 w-56 sm:w-64 mb-4 md:mb-6" />

        {/* Stats Summary - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={`slot-stat-${i}`}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4"
            >
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Most/Least Popular - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {[1, 2].map((i) => (
            <div
              key={`popular-slot-${i}`}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 md:p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 md:h-9 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6">
          <Skeleton className="h-5 md:h-6 w-56 mb-4" />
          <div className="w-full h-80 sm:h-96 md:h-[28rem]">
            <div className="h-full flex items-end justify-between gap-1 px-2">
              {[
                { height: "h-44" },
                { height: "h-60" },
                { height: "h-40" },
                { height: "h-68" },
                { height: "h-52" },
                { height: "h-56" },
                { height: "h-64" },
                { height: "h-36" },
                { height: "h-56" },
                { height: "h-48" },
              ].map((bar, i) => (
                <div
                  key={`slot-bar-${i}`}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <Skeleton className={`w-full rounded-t-lg ${bar.height}`} />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
