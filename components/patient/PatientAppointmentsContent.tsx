"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PatientAppointments from "./PatientAppointments";
import type { AppointmentItem } from "@/lib/appointments_types";
import { api } from "@/lib/axios";
import AuthError from "@/components/shared/AuthError";
import AppointmentsListSkeleton from "@/components/shared/AppointmentsListSkeleton";

export default function PatientAppointmentsContent() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);
        if (search) queryParams.append("search", search);
        queryParams.append("page", page.toString());
        queryParams.append("page_size", pageSize.toString());

        const response = await api.get<{
          appointments: AppointmentItem[];
          total: number;
          total_pages?: number;
        }>(`/appointments/my-appointments?${queryParams.toString()}`);

        setAppointments(response.data.appointments);
        setTotal(response.data.total);
        setTotalPages(
          response.data.total_pages || Math.ceil(response.data.total / pageSize),
        );
        setIsInitialLoad(false);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        const message =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load appointments";
        setError(message);
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [page, status, search, pageSize]);

  if (error) {
    // If it's an auth error, show a more helpful message
    if (error.includes("Unauthorized") || error.includes("No access token")) {
      return (
        <AuthError message="Please refresh the page to reload your appointments." />
      );
    }
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">Error loading appointments</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show skeleton only for initial load, or show appointments with loading state
  if (isInitialLoad && loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-slate-700">
            View and manage your appointments
          </p>
        </div>

        {/* Search and Filter Bar - Always visible */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Doctor Name
              </label>
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Appointments List Skeleton */}
        <AppointmentsListSkeleton />
      </div>
    );
  }

  return (
    <PatientAppointments
      initialAppointments={appointments}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialTotalPages={totalPages}
      isLoading={loading && !isInitialLoad}
    />
  );
}
