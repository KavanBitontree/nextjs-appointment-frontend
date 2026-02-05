"use client";

import PatientLayout from "@/components/patient/PatientLayout";
import AppointmentForm from "@/components/patient/AppointmentForm";

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
  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-3 sm:py-10 sm:px-4">
        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                  Book Appointment
                </h1>
                <p className="text-sm sm:text-base text-slate-600">
                  Schedule your consultation with Dr. {doctorData.name}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs sm:text-sm text-slate-500 mb-1">
                  Consultation Fee
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
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
