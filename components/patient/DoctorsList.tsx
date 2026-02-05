"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  MapPin,
  IndianRupee,
  AlertCircle,
  Loader,
  Loader2,
  Calendar,
} from "lucide-react";

interface Doctor {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  address: string;
  opd_fees: string | number;
  experience?: number;
  latitude?: number;
  longitude?: number;
  minimum_slot_duration?: string;
}

interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  skip: number;
  limit: number;
}

interface DoctorListProps {
  initialData: DoctorsResponse | null;
  filters: {
    search_name?: string;
    search_address?: string;
    filter_speciality?: string;
    sort_by?: string;
    sort_order?: string;
    skip?: number;
    limit?: number;
  };
  onPageChange: (skip: number) => void;
  isPending: boolean;
  loading: boolean;
  error: string | null;
}

export default function DoctorsList({
  initialData,
  filters,
  onPageChange,
  isPending,
  loading,
  error,
}: DoctorListProps) {
  const router = useRouter();
  const [navigatingToDoctorId, setNavigatingToDoctorId] = useState<
    number | null
  >(null);

  const doctors = initialData?.doctors || [];
  const total = initialData?.total || 0;

  const handleBookNow = (doctorId: number) => {
    console.log("[v0] Booking appointment for doctor:", doctorId);
    setNavigatingToDoctorId(doctorId);

    // Use push with explicit string URL and type assertion to ensure proper routing
    const appointmentUrl = `/patient/${doctorId}/appointment-form`;
    console.log("[v0] Navigating to:", appointmentUrl);

    // Use startTransition to ensure proper navigation state
    try {
      router.push(appointmentUrl);
      console.log("[v0] Navigation triggered successfully");
    } catch (error) {
      console.error("[v0] Navigation error:", error);
      setNavigatingToDoctorId(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-8 h-8 text-slate-900" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 rounded-2xl p-12 border border-red-200 text-center"
      >
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-medium">Error loading doctors</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </motion.div>
    );
  }

  if (!initialData || doctors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-50 rounded-2xl p-12 border border-slate-200 text-center"
      >
        <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">No doctors found</p>
        <p className="text-slate-500 text-sm mt-2">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid gap-6 mb-8">
        {doctors.map((doctor, index) => {
          const isNavigating = navigatingToDoctorId === doctor.id;

          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Doctor Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {doctor.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="w-4 h-4 text-slate-900" />
                    <span className="text-slate-900 font-medium">
                      {doctor.speciality}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">Clinic Address</p>
                        <p className="text-sm font-medium text-slate-900">
                          {doctor.address}
                        </p>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="flex items-start gap-3">
                      <IndianRupee className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-slate-600">OPD Fees</p>
                        <p className="text-sm font-medium text-slate-900">
                          ₹
                          {typeof doctor.opd_fees === "string"
                            ? parseFloat(doctor.opd_fees).toFixed(2)
                            : doctor.opd_fees}
                        </p>
                      </div>
                    </div>

                    {/* Experience */}
                    {doctor.experience && (
                      <div>
                        <p className="text-xs text-slate-600">Experience</p>
                        <p className="text-sm font-medium text-slate-900">
                          {doctor.experience} years
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <motion.button
                  onClick={() => handleBookNow(doctor.id)}
                  disabled={isNavigating}
                  whileHover={!isNavigating ? { scale: 1.05 } : {}}
                  whileTap={!isNavigating ? { scale: 0.95 } : {}}
                  className={`
                    px-6 py-3 rounded-xl transition-colors font-medium text-sm 
                    flex-shrink-0 h-fit flex items-center gap-2 min-w-[140px] justify-center
                    ${
                      isNavigating
                        ? "bg-slate-700 cursor-wait"
                        : "bg-slate-900 hover:bg-slate-800"
                    }
                    text-white
                  `}
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
