"use client";

import { useEffect, useState } from "react";
import DoctorDashboardHome from "./DoctorDashboardHome";
import type {
  DashboardOverview,
  RevenueAllTimeframes,
  AppointmentStatusAllPeriods,
  LeaveStats,
  SlotPreferencesAll,
} from "@/lib/server-api";

// Import client-side API functions (we'll create these)
import { api } from "@/lib/axios";

type DashboardData = {
  dashboardOverview: DashboardOverview;
  revenueData: RevenueAllTimeframes;
  appointmentStatusData: AppointmentStatusAllPeriods;
  leaveData: LeaveStats;
  slotPreferences: SlotPreferencesAll;
};

export default function DoctorDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel using client-side API
        const [
          dashboardOverview,
          revenueData,
          appointmentStatusData,
          leaveData,
          slotPreferences,
        ] = await Promise.all([
          api.get<DashboardOverview>("/doctor/analytics/dashboard"),
          api.get<RevenueAllTimeframes>("/doctor/analytics/revenue/all", {
            params: {
              daily_days: 30,
              weekly_weeks: 4,
              monthly_months: 6,
            },
          }),
          api.get<AppointmentStatusAllPeriods>(
            "/doctor/analytics/appointments/status/all",
          ),
          api.get<LeaveStats>("/doctor/analytics/leave/current-month"),
          api.get<SlotPreferencesAll>(
            "/doctor/analytics/slots/preferences/all",
          ),
        ]);

        setData({
          dashboardOverview: dashboardOverview.data,
          revenueData: revenueData.data,
          appointmentStatusData: appointmentStatusData.data,
          leaveData: leaveData.data,
          slotPreferences: slotPreferences.data,
        });
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        const message =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load dashboard data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <p className="font-medium mb-2">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <DoctorDashboardHome
      dashboardOverview={data.dashboardOverview}
      revenueData={data.revenueData}
      appointmentStatusData={data.appointmentStatusData}
      leaveData={data.leaveData}
      slotPreferences={data.slotPreferences}
    />
  );
}
