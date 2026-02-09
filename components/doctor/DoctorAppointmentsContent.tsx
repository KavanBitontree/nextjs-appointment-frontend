"use client";

import { useEffect, useState, use } from "react";
import DoctorAppointments from "./DoctorAppointments";
import type { AppointmentItem } from "@/lib/appointments_types";
import { api } from "@/lib/axios";
import AuthError from "@/components/shared/AuthError";

type SearchParams = Promise<{
  page?: string;
  status?: string;
  search?: string;
}>;

interface DoctorAppointmentsContentProps {
  searchParams: SearchParams;
}

export default function DoctorAppointmentsContent({
  searchParams,
}: DoctorAppointmentsContentProps) {
  const params = use(searchParams);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 10;
  const status = params.status ?? "";
  const search = params.search ?? "";

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
        }>(`/appointments/doctor-appointments?${queryParams.toString()}`);

        setAppointments(response.data.appointments);
        setTotal(response.data.total);
        setTotalPages(
          response.data.total_pages ?? Math.ceil(response.data.total / pageSize),
        );
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        const message =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load appointments";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [page, status, search, pageSize]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

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

  return (
    <DoctorAppointments
      initialAppointments={appointments}
      initialTotal={total}
      initialPage={page}
      initialPageSize={pageSize}
      initialTotalPages={totalPages}
    />
  );
}
