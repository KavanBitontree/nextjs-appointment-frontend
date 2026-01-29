"use client";

import { motion } from "framer-motion";
import {
  Stethoscope,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
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
  console.log("DoctorsList received initialData:", initialData);
  console.log("Is loading:", loading, "isPending:", isPending);

  const doctors = initialData?.doctors || [];
  const total = initialData?.total || 0;

  console.log("Doctors array:", doctors);
  console.log("Total:", total);

  const currentPage = filters.skip
    ? Math.floor(filters.skip / (filters.limit || 10)) + 1
    : 1;
  const totalPages = Math.ceil(total / (filters.limit || 10));

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-8 h-8 text-blue-600" />
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
      {/* Doctors Grid */}
      <div className="grid gap-6 mb-8">
        {doctors.map((doctor, index) => {
          console.log("Rendering doctor:", doctor);
          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Doctor Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {doctor.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">
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
                      <DollarSign className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex-shrink-0 h-fit"
                >
                  Book Now
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {doctors.length} of {total} doctors
            {totalPages > 0 && ` (Page ${currentPage} of ${totalPages})`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onPageChange(
                  Math.max(0, (filters.skip || 0) - (filters.limit || 10)),
                )
              }
              disabled={currentPage === 1 || isPending}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                const skip = (pageNum - 1) * (filters.limit || 10);
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(skip)}
                    disabled={isPending}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                onPageChange((filters.skip || 0) + (filters.limit || 10))
              }
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
