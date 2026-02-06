"use client";

import React from "react";
import { Calendar, Briefcase, Coffee } from "lucide-react";

type Props = {
  data: {
    month: number;
    year: number;
    total_days_in_month: number;
    working_days: number;
    leave_days: number;
    leave_percentage: number;
    leave_dates: string[];
  };
};

export default function LeaveAnalytics({ data }: Props) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="text-center p-3 md:p-4 bg-slate-50 rounded-lg">
          <div className="bg-slate-100 p-2 md:p-3 rounded-lg inline-block mb-2 md:mb-3">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-slate-900">
            {data.total_days_in_month}
          </p>
          <p className="text-xs md:text-sm text-slate-600">Total Days</p>
        </div>

        <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
          <div className="bg-green-100 p-2 md:p-3 rounded-lg inline-block mb-2 md:mb-3">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {data.working_days}
          </p>
          <p className="text-xs md:text-sm text-slate-600">Working Days</p>
        </div>

        <div className="text-center p-3 md:p-4 bg-orange-50 rounded-lg">
          <div className="bg-orange-100 p-2 md:p-3 rounded-lg inline-block mb-2 md:mb-3">
            <Coffee className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-orange-600">
            {data.leave_days}
          </p>
          <p className="text-xs md:text-sm text-slate-600">Leave Days</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-sm md:text-base font-medium text-slate-700">
            Leave Percentage
          </span>
          <span className="text-sm md:text-base font-bold text-slate-900">
            {data.leave_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 md:h-3">
          <div
            className="bg-orange-500 h-2 md:h-3 rounded-full transition-all"
            style={{ width: `${data.leave_percentage}%` }}
          />
        </div>
      </div>

      {/* Leave Dates */}
      {data.leave_dates.length > 0 && (
        <div>
          <p className="text-sm md:text-base font-medium text-slate-700 mb-2 md:mb-3">
            Leave Dates ({data.leave_dates.length})
          </p>
          <div className="bg-slate-50 rounded-lg p-3 md:p-4 max-h-40 md:max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {data.leave_dates.slice(0, 10).map((date) => (
                <span
                  key={date}
                  className="px-2 md:px-3 py-1 md:py-2 bg-white border border-slate-200 rounded text-xs md:text-sm text-slate-600"
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ))}
              {data.leave_dates.length > 10 && (
                <span className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm text-slate-500">
                  +{data.leave_dates.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
