"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { api } from "@/lib/axios";
import { AuthGuard } from "@/context/AuthContext";
import AppointmentFormPage from "./AppointmentFormPage";

interface Doctor {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  address: string;
  opd_fees: string | number;
  experience?: number;
  minimum_slot_duration?: string;
}

interface Slot {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "FREE" | "HELD" | "BOOKED" | "BLOCKED";
  held_until?: string;
  held_by_current_user?: boolean;
}

interface AppointmentFormRouteProps {
  doctorId: number;
}

export default function AppointmentFormRoute({
  doctorId,
}: AppointmentFormRouteProps) {
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [slotsData, setSlotsData] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);

        const params = new URLSearchParams({
          doctor_id: String(doctorId),
          start_date: today.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          status: "FREE",
        });

        const [doctorRes, slotsRes] = await Promise.all([
          api.get<Doctor>(`/doctors/${doctorId}`),
          api.get<{ slots: Slot[] }>(
            `/patient/view/slots?${params.toString()}`,
          ),
        ]);

        if (!isMounted) return;

        setDoctorData(doctorRes.data);
        setSlotsData(slotsRes.data.slots || []);
      } catch (e: any) {
        if (!isMounted) return;

        console.error("[appointment-form-route] Failed to load data:", e);

        const message =
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to load appointment data. Please try again.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  return (
    <AuthGuard allowedRoles={["patient"]}>
      {loading && !error && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
              <p className="text-slate-700 text-sm">
                Loading appointment details...
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Failed to Load Appointment
                  </h1>
                  <p className="text-slate-600 mb-3">
                    We couldn&apos;t load this doctor&apos;s appointment slots.
                  </p>
                  <p className="text-sm text-red-700 mb-6">{error}</p>

                  <button
                    onClick={() => window.location.assign("/patient/doctors")}
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Doctors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && doctorData && (
        <AppointmentFormPage
          doctorId={doctorId}
          doctorData={doctorData}
          slotsData={slotsData}
        />
      )}
    </AuthGuard>
  );
}


