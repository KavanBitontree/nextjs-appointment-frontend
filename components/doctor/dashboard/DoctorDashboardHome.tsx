"use client";

import React, { useState } from "react";
import QuickStatsCards from "./QuickStatsCards";
import RevenueChart from "./RevenueChart";
import AppointmentStatusChart from "./AppointmentStatusChart";
import LeaveAnalytics from "./LeaveAnalytics";
import SlotPreferencesChart from "./SlotPreferencesChart";
import TimeframeSelector from "./TimeframeSelector";

type Props = {
  dashboardOverview: any;
  revenueData: any;
  appointmentStatusData: any;
  leaveData: any;
  slotPreferences: any;
};

export default function DoctorDashboardHome({
  dashboardOverview,
  revenueData,
  appointmentStatusData,
  leaveData,
  slotPreferences,
}: Props) {
  const [revenueTimeframe, setRevenueTimeframe] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  const [statusTimeframe, setStatusTimeframe] = useState<
    "today" | "this_week" | "this_month" | "all_time"
  >("today");

  return (
    <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
          Welcome back, Dr. {dashboardOverview.doctor_name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          {dashboardOverview.speciality} • ₹{dashboardOverview.opd_fees} per
          consultation
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStatsCards stats={dashboardOverview.quick_stats} />

      {/* Revenue Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-6 mb-4 md:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
            Revenue Analytics
          </h2>
          <TimeframeSelector
            value={revenueTimeframe}
            onChange={setRevenueTimeframe}
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </div>
        <RevenueChart
          data={revenueData[revenueTimeframe]}
          timeframe={revenueTimeframe}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Appointment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Appointment Status
            </h2>
            <TimeframeSelector
              value={statusTimeframe}
              onChange={setStatusTimeframe}
              options={[
                { value: "today", label: "Today" },
                { value: "this_week", label: "Week" },
                { value: "this_month", label: "Month" },
                { value: "all_time", label: "All Time" },
              ]}
            />
          </div>
          <AppointmentStatusChart
            data={appointmentStatusData[statusTimeframe]}
          />
        </div>

        {/* Leave Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 md:mb-6">
            Leave Analytics -{" "}
            {new Date().toLocaleString("default", { month: "long" })}
          </h2>
          <LeaveAnalytics data={leaveData} />
        </div>
      </div>

      {/* Slot Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 md:mb-6">
          Patient Time Slot Preferences
        </h2>
        <SlotPreferencesChart data={slotPreferences} />
      </div>
    </div>
  );
}
