"use client";

import React from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Users,
} from "lucide-react";

type QuickStats = {
  total_appointments_today: number;
  total_appointments_this_week: number;
  total_appointments_this_month: number;
  total_appointments_all_time: number;
  pending_approvals: number;
  upcoming_appointments: number;
  completed_this_month: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  revenue_all_time: number;
};

type Props = {
  stats: QuickStats;
};

export default function QuickStatsCards({ stats }: Props) {
  const cards = [
    {
      title: "Today's Appointments",
      value: stats.total_appointments_today,
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Approvals",
      value: stats.pending_approvals,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      highlight: stats.pending_approvals > 0,
    },
    {
      title: "Upcoming (Paid)",
      value: stats.upcoming_appointments,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed This Month",
      value: stats.completed_this_month,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenue Today",
      value: `₹${stats.revenue_today.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Revenue This Month",
      value: `₹${stats.revenue_this_month.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm border p-4 md:p-6 transition-all hover:shadow-md active:shadow-md ${
              card.highlight
                ? "border-orange-300 ring-2 ring-orange-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                  {card.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 break-words">
                  {card.value}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 md:p-4 rounded-lg flex-shrink-0`}>
                <Icon className={`h-6 w-6 md:h-7 md:w-7 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
