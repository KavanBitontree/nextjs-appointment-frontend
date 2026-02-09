"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DoctorAppointments from "./DoctorAppointments";
import type { AppointmentItem } from "@/lib/appointments_types";
import { api } from "@/lib/axios";
import AuthError from "@/components/shared/AuthError";
import AppointmentsSkeleton from "@/components/shared/AppointmentsSkeleton";

export default function DoctorAppointmentsContent() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 10;
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

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
    return <AppointmentsSkeleton />;
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
