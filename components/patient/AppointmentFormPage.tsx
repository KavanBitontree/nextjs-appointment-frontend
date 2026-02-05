"use client";

import { useEffect } from "react";
import PatientLayout from "@/components/patient/PatientLayout";
import AppointmentForm from "@/components/patient/AppointmentForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

interface AppointmentFormPageProps {
  doctorId: number;
  doctorData: Doctor;
  slotsData: Slot[];
}

export default function AppointmentFormPage({
  doctorId,
  doctorData,
  slotsData,
}: AppointmentFormPageProps) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();

  // Check auth status on mount - if not authenticated and auth has finished loading, redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("[v0] Not authenticated, redirecting to login");
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while auth is being checked
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Book Appointment
                </h1>
                <p className="text-slate-600">
                  Schedule your consultation with Dr. {doctorData.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">
                  Consultation Fee
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{doctorData.opd_fees}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Speciality</p>
                <p className="font-medium text-slate-900">
                  {doctorData.speciality}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Experience</p>
                <p className="font-medium text-slate-900">
                  {doctorData.experience || "N/A"} years
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-medium text-slate-900">
                  {doctorData.address}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <AppointmentForm
            doctorId={doctorId}
            doctorName={doctorData.name}
            slots={slotsData}
            opdFees={Number(doctorData.opd_fees)}
          />
        </div>
      </div>
    </PatientLayout>
  );
}
