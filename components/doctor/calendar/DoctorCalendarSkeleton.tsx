"use client";

import React from "react";
import {
  CheckCircle,
  Lock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function pad2(n: number) {
  return `${n}`.padStart(2, "0");
}

function getMonthGridDaysForSkeleton() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(start.getDate() - startDay);

  const endDay = lastDay.getDay();
  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - endDay));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return { days, month: today };
}

export default function DoctorCalendarSkeleton() {
  const { days, month } = getMonthGridDaysForSkeleton();
  const monthLabel = `${month.toLocaleString(undefined, { month: "long" })} ${month.getFullYear()}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-2 sm:p-4 md:p-6 min-h-screen bg-slate-50 animate-pulse">
      {/* Main Calendar Section */}
      <div className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-4 flex-shrink-0">
          <div className="min-w-0">
            <div className="h-6 sm:h-7 md:h-8 bg-slate-200 rounded w-32 sm:w-40"></div>
            <div className="h-3 sm:h-4 bg-slate-100 rounded w-48 sm:w-64 mt-1 sm:mt-2"></div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
            <button
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            </button>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 text-center min-w-fit px-2 flex-shrink-0">
              {monthLabel}
            </div>
            <button
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
              disabled
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300">Free</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300">Blocked</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300">Booked</span>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2 mb-2 text-[10px] sm:text-xs font-semibold text-slate-300">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="px-1 text-center h-6 sm:h-8 flex items-center justify-center flex-shrink-0"
            >
              <span className="hidden sm:inline truncate">{d}</span>
              <span className="sm:hidden truncate">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
          {days.map((d, idx) => {
            const iso = d.toISOString().split("T")[0];
            const inMonth = d.getMonth() === month.getMonth();

            return (
              <div
                key={iso}
                className={[
                  "min-h-20 sm:h-24 rounded-lg sm:rounded-xl border border-slate-200 bg-white p-1.5 sm:p-2 flex flex-col",
                  !inMonth ? "opacity-30" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-1 flex-shrink-0 mb-1">
                  <div className="text-xs sm:text-sm font-semibold text-slate-300 flex-shrink-0">
                    {pad2(d.getDate())}
                  </div>
                  {d.getDay() === 0 && (
                    <div className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-300 flex-shrink-0 whitespace-nowrap">
                      Sun
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-1 text-[9px] sm:text-[11px]">
                  {/* Simulate varying slot states */}
                  {idx % 3 === 0 ? (
                    <div className="text-slate-300 truncate">No slots</div>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap gap-y-1">
                      {idx % 2 === 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-slate-200 flex-shrink-0" />
                          <span className="font-semibold text-slate-300">
                            {Math.floor(Math.random() * 5) + 1}
                          </span>
                        </div>
                      )}
                      {idx % 3 === 1 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Lock className="w-3 h-3 text-slate-200 flex-shrink-0" />
                          <span className="font-semibold text-slate-300">
                            {Math.floor(Math.random() * 3) + 1}
                          </span>
                        </div>
                      )}
                      {idx % 5 === 2 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Calendar className="w-3 h-3 text-slate-200 flex-shrink-0" />
                          <span className="font-semibold text-slate-300">
                            {Math.floor(Math.random() * 2) + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 h-4 bg-slate-100 rounded w-32"></div>
      </div>

      {/* Sidebar Section */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 flex flex-col h-fit lg:h-auto">
        {/* Selected Date Section */}
        <div>
          <div className="flex flex-col gap-3">
            <div>
              <div className="h-5 sm:h-6 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 sm:h-4 bg-slate-100 rounded w-full mb-1"></div>
              <div className="h-3 sm:h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
            <div className="h-9 bg-slate-200 rounded-lg w-full sm:w-32"></div>
          </div>

          {/* Slots list skeleton */}
          <div className="mt-4 divide-y divide-slate-200 rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-2 sm:gap-0"
              >
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-slate-100 rounded w-20"></div>
                </div>
                <div className="h-9 bg-slate-100 rounded-lg w-full sm:w-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Sundays Section */}
        <div className="rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="h-4 bg-slate-200 rounded w-40 mb-3"></div>
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <div className="h-3 bg-slate-100 rounded w-12 mb-1"></div>
                <div className="h-9 bg-slate-100 rounded-lg w-full"></div>
              </div>
              <div className="h-9 bg-slate-200 rounded-lg w-20"></div>
            </div>
          </div>
          <div className="mt-2 h-3 bg-slate-100 rounded w-full"></div>
        </div>

        {/* Leave Range Section */}
        <div className="rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4">
          <div className="h-4 bg-slate-200 rounded w-28 mb-3"></div>
          <div className="flex flex-col gap-2 sm:gap-3">
            <div>
              <div className="h-3 bg-slate-100 rounded w-16 mb-1"></div>
              <div className="h-9 bg-slate-100 rounded-lg w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-slate-100 rounded w-16 mb-1"></div>
              <div className="h-9 bg-slate-100 rounded-lg w-full"></div>
            </div>
          </div>
          <div className="mt-3 h-9 bg-slate-200 rounded-lg w-full"></div>
          <div className="mt-2 h-3 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
