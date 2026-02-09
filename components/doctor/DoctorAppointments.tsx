"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
  Phone,
  ImageIcon,
  File,
} from "lucide-react";
import { motion } from "framer-motion";
import SearchInput from "@/components/shared/SearchInput";
import FilterSelect from "@/components/shared/FilterSelect";
import Pagination from "@/components/shared/Pagination";
import AppointmentsListSkeleton from "@/components/shared/AppointmentsListSkeleton";
import { AppointmentStatus, AppointmentItem } from "@/lib/appointments_types";

type DoctorAppointmentsProps = {
  initialAppointments: AppointmentItem[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
  isLoading?: boolean;
};

const statusOptions = [
  { label: "Requested", value: AppointmentStatus.REQUESTED },
  { label: "Approved", value: AppointmentStatus.APPROVED },
  { label: "Rejected", value: AppointmentStatus.REJECTED },
  { label: "Paid", value: AppointmentStatus.PAID },
  { label: "Cancelled", value: AppointmentStatus.CANCELLED },
];

const getStatusBadge = (status: AppointmentStatus) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5";

  switch (status) {
    case AppointmentStatus.REQUESTED:
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <AlertCircle className="h-3.5 w-3.5" />
          Pending
        </span>
      );
    case AppointmentStatus.APPROVED:
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    case AppointmentStatus.REJECTED:
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    case AppointmentStatus.PAID:
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          <CreditCard className="h-3.5 w-3.5" />
          Confirmed
        </span>
      );
    case AppointmentStatus.CANCELLED:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
        </span>
      );
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTimeRemaining = (timeRemaining: {
  hours?: number;
  minutes: number;
  seconds?: number;
}) => {
  if (timeRemaining.hours !== undefined && timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
  }
  if (timeRemaining.seconds !== undefined) {
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  }
  return `${timeRemaining.minutes}m`;
};

// Helper function to determine if URL is an image or PDF
const getFileType = (url: string): "image" | "pdf" | "unknown" => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(".pdf") || lowerUrl.includes("pdf")) {
    return "pdf";
  }
  if (
    lowerUrl.includes(".jpg") ||
    lowerUrl.includes(".jpeg") ||
    lowerUrl.includes(".png") ||
    lowerUrl.includes(".webp") ||
    lowerUrl.includes("image")
  ) {
    return "image";
  }
  return "unknown";
};

// Report Preview Component
const ReportPreview = ({ reportUrl }: { reportUrl: string }) => {
  const fileType = getFileType(reportUrl);

  return (
    <a
      href={reportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
        {/* Preview Thumbnail */}
        {fileType === "image" ? (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white border border-slate-200">
            <img
              src={reportUrl || "/placeholder.svg"}
              alt="Report preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ) : fileType === "pdf" ? (
          <div className="w-16 h-16 flex-shrink-0 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
            <File className="h-8 w-8 text-red-600" />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
            {fileType === "pdf" ? "PDF Report" : "Medical Report"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click to view full {fileType === "pdf" ? "document" : "image"}
          </p>
        </div>

        {/* View Icon */}
        <div className="flex-shrink-0">
          <div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
            {fileType === "image" ? (
              <ImageIcon className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
            ) : (
              <FileText className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default function DoctorAppointments({
  initialAppointments,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  isLoading = false,
}: DoctorAppointmentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync state when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");
    
    setSearchQuery(urlSearch);
    setStatusFilter(urlStatus);
    setCurrentPage(urlPage);
  }, [searchParams, initialPage]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      updateURL(1, statusFilter, value);
    },
    [statusFilter],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      setCurrentPage(1);
      updateURL(1, value, searchQuery);
    },
    [searchQuery],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL(page, statusFilter, searchQuery);
    },
    [statusFilter, searchQuery],
  );

  const updateURL = (page: number, status: string, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    const queryString = params.toString();
    router.push(`/doctor/appointments${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleAction = (
    appointmentId: number,
    action: "approve" | "reject",
  ) => {
    router.push(`/doctor/appointments/${appointmentId}/${action}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
          Appointments
        </h1>
        <p className="text-sm sm:text-base text-slate-700">
          Manage and review appointment requests
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SearchInput
            label="Patient Name"
            placeholder="Search by patient name..."
            onSearch={handleSearch}
            initialValue={searchQuery}
          />
        </div>

        <FilterSelect
          options={statusOptions}
          value={statusFilter}
          onChange={handleFilterChange}
          label="Status"
          placeholder="All Statuses"
          expandable={true}
          defaultExpanded={false}
        />
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <AppointmentsListSkeleton />
      ) : initialAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No appointments found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchQuery || statusFilter
              ? "Try adjusting your filters"
              : "No appointment requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                {/* Top Section - Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {appointment.patient_name || "Patient"}
                    </h3>
                    {appointment.patient_contact && (
                      <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5" />
                        {appointment.patient_contact}
                      </p>
                    )}
                  </div>
                  <div className="self-start">
                    {getStatusBadge(appointment.status as AppointmentStatus)}
                  </div>
                </div>

                {/* Middle Section - Appointment Info */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(appointment.slot_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{appointment.slot_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CreditCard className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>₹{appointment.opd_fees}</span>
                    </div>
                  </div>

                  {/* Time Remaining Indicators */}
                  {appointment.approval_time_remaining && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <Clock className="inline h-4 w-4 mr-1" />
                        You have{" "}
                        <strong>
                          {formatTimeRemaining(
                            appointment.approval_time_remaining,
                          )}
                        </strong>{" "}
                        to respond
                      </p>
                    </div>
                  )}

                  {appointment.payment_time_remaining && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="inline h-4 w-4 mr-1" />
                        Awaiting payment in{" "}
                        <strong>
                          {formatTimeRemaining(
                            appointment.payment_time_remaining,
                          )}
                        </strong>
                      </p>
                    </div>
                  )}

                  {/* Report Preview */}
                  {appointment.report && (
                    <div className="pt-2">
                      <ReportPreview reportUrl={appointment.report} />
                    </div>
                  )}
                </div>

                {/* Bottom Section - Booking Info & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Requested on {formatDate(appointment.created_at)}
                  </p>

                  {/* Action Buttons */}
                  {appointment.status === AppointmentStatus.REQUESTED && (
                    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAction(appointment.id, "approve")}
                        className="flex-1 xs:flex-none px-4 sm:px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(appointment.id, "reject")}
                        className="flex-1 xs:flex-none px-4 sm:px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {initialTotalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={initialTotalPages}
            onPageChange={handlePageChange}
            totalItems={initialTotal}
            itemsPerPage={initialPageSize}
            currentCount={initialAppointments.length}
          />
        </div>
      )}
    </motion.div>
  );
}
