"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  Timer,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

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

interface AppointmentFormProps {
  doctorId: number;
  doctorName: string;
  slots: Slot[];
  opdFees: number;
}

const STATUS_COLORS = {
  FREE: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    hover: "hover:bg-emerald-100 hover:border-emerald-300",
    label: "Available",
    icon: "🟢",
  },
  HELD: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    hover: "",
    label: "Being Booked",
    icon: "🟡",
  },
  BOOKED: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    hover: "",
    label: "Booked",
    icon: "🔴",
  },
  BLOCKED: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-400",
    hover: "",
    label: "Unavailable",
    icon: "⚫",
  },
};

const ALLOWED_FORMATS = {
  types: ["application/pdf", "image/jpeg", "image/png"],
  extensions: ["pdf", "jpg", "jpeg", "png"],
  display: "PDF, JPEG, PNG",
};

function getLocalDateString(year: number, month: number, day: number): string {
  const yyyy = year.toString();
  const mm = (month + 1).toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AppointmentForm({
  doctorId,
  doctorName,
  slots: initialSlots,
  opdFees,
}: AppointmentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const slotsRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [holdingSlot, setHoldingSlot] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [heldSlotExpiry, setHeldSlotExpiry] = useState<Date | null>(null);

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [slots]);

  const datesWithFreeSlots = useMemo(() => {
    return Object.keys(slotsByDate).filter((date) => {
      return slotsByDate[date].some((slot) => slot.status === "FREE");
    });
  }, [slotsByDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return (slotsByDate[selectedDate] || []).sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );
  }, [selectedDate, slotsByDate]);

  const scrollToSlots = useCallback(() => {
    setTimeout(() => {
      slotsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (!heldSlotExpiry) {
      setTimeRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(
        0,
        Math.floor((heldSlotExpiry.getTime() - now.getTime()) / 1000),
      );

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setHeldSlotExpiry(null);
        setSelectedSlotId(null);
        setError(
          "Your slot reservation has expired. Please select another slot.",
        );
        showToast(
          "Slot reservation expired. Please select another slot.",
          "warning",
        );
        if (selectedDate) {
          fetchSlotsForDate(selectedDate);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [heldSlotExpiry, selectedDate, showToast]);

  const fetchSlotsForDate = useCallback(
    async (date: string) => {
      setFetchingSlots(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          doctor_id: doctorId.toString(),
          date: date,
        });

        const response = await api.get(
          `/patient/slots/by-date?${params.toString()}`,
        );

        setSlots((prevSlots) => {
          const otherDateSlots = prevSlots.filter((s) => s.date !== date);
          return [...otherDateSlots, ...(response.data.slots || [])];
        });
      } catch (err: any) {
        console.error("Error fetching slots:", err);
        setError("Failed to fetch available slots. Please try again.");
        showToast("Failed to fetch slots", "error");
      } finally {
        setFetchingSlots(false);
      }
    },
    [doctorId, showToast],
  );

  const holdSlot = useCallback(
    async (slotId: number) => {
      setHoldingSlot(true);
      setError(null);

      try {
        const response = await api.post(`/patient/slots/${slotId}/hold`);

        setSlots((prevSlots) =>
          prevSlots.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  status: "HELD",
                  held_until: response.data.held_until,
                  held_by_current_user: true,
                }
              : s,
          ),
        );

        setHeldSlotExpiry(new Date(response.data.held_until));
        setTimeRemaining(response.data.time_remaining_seconds);

        showToast(
          "Slot reserved successfully! Complete booking within 10 minutes.",
          "success",
        );

        setTimeout(() => {
          uploadRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 500);

        return true;
      } catch (err: any) {
        console.error("Error holding slot:", err);

        if (err.response?.status === 409) {
          setError(
            "This slot was just booked by someone else. Please select another slot.",
          );
          showToast("Slot unavailable. Please select another.", "error");
          const slotDate = slots.find((s) => s.id === slotId)?.date;
          if (slotDate) {
            await fetchSlotsForDate(slotDate);
          }
        } else {
          setError("Failed to reserve this slot. Please try again.");
          showToast("Failed to reserve slot", "error");
        }

        setSelectedSlotId(null);
        return false;
      } finally {
        setHoldingSlot(false);
      }
    },
    [slots, fetchSlotsForDate, showToast],
  );

  const releaseSlot = useCallback(async (slotId: number) => {
    try {
      await api.post(`/patient/slots/${slotId}/release`);

      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.id === slotId
            ? {
                ...s,
                status: "FREE",
                held_until: undefined,
                held_by_current_user: false,
              }
            : s,
        ),
      );

      setHeldSlotExpiry(null);
      setTimeRemaining(null);
    } catch (err) {
      console.error("Error releasing slot:", err);
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
    if (selectedSlotId) {
      const slot = slots.find((s) => s.id === selectedSlotId);
      if (slot?.held_by_current_user) {
        releaseSlot(selectedSlotId);
      }
    }
    setSelectedDate(null);
    setSelectedSlotId(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
    if (selectedSlotId) {
      const slot = slots.find((s) => s.id === selectedSlotId);
      if (slot?.held_by_current_user) {
        releaseSlot(selectedSlotId);
      }
    }
    setSelectedDate(null);
    setSelectedSlotId(null);
  };

  const isDateAvailable = (day: number) => {
    const dateString = getLocalDateString(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return datesWithFreeSlots.includes(dateString);
  };

  const isDateInPast = (day: number) => {
    const today = new Date();
    const todayString = getLocalDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const dateString = getLocalDateString(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    return dateString < todayString;
  };

  const handleDateSelect = async (day: number) => {
    const dateString = getLocalDateString(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    if (isDateAvailable(day) && !isDateInPast(day)) {
      if (selectedSlotId) {
        const slot = slots.find((s) => s.id === selectedSlotId);
        if (slot?.held_by_current_user) {
          await releaseSlot(selectedSlotId);
        }
      }

      setSelectedDate(dateString);
      setSelectedSlotId(null);

      await fetchSlotsForDate(dateString);
      scrollToSlots();
    }
  };

  const handleSlotSelect = async (slot: Slot) => {
    if (slot.status !== "FREE") return;

    if (selectedSlotId && selectedSlotId !== slot.id) {
      const prevSlot = slots.find((s) => s.id === selectedSlotId);
      if (prevSlot?.held_by_current_user) {
        await releaseSlot(selectedSlotId);
      }
    }

    setSelectedSlotId(slot.id);
    await holdSlot(slot.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (
        !ALLOWED_FORMATS.types.includes(file.type) ||
        !ALLOWED_FORMATS.extensions.includes(fileExtension || "")
      ) {
        setError(
          `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.display}`,
        );
        showToast(`Please upload ${ALLOWED_FORMATS.display} only`, "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        showToast("File size exceeds 5MB limit", "error");
        return;
      }

      setReportFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlotId) {
      setError("Please select a time slot");
      showToast("Please select a time slot", "warning");
      return;
    }

    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot?.held_by_current_user) {
      setError("Please hold a slot before booking");
      showToast("Slot reservation expired", "error");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (reportFile) {
        formData.append("report", reportFile);
      }

      const response = await api.post(
        `/appointments/request?slot_id=${selectedSlotId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showToast(
        "Appointment request sent successfully! Doctor will review within 48 hours.",
        "success",
        6000,
      );

      setTimeout(() => {
        router.push("/patient/dashboard?booking=success");
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting appointment:", err);

      let errorMessage = "Failed to submit appointment request";

      if (err.response) {
        if (err.response.status === 409) {
          errorMessage =
            "This slot is no longer available. Please select another slot.";
          if (selectedDate) {
            await fetchSlotsForDate(selectedDate);
          }
          setSelectedSlotId(null);
        } else if (err.response.status === 400) {
          const detail = err.response.data?.detail;
          if (typeof detail === "object" && detail.message) {
            errorMessage = detail.message;
          } else if (typeof detail === "string") {
            errorMessage = detail;
          } else {
            errorMessage = "Invalid request. Please check your input.";
          }
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to book this slot.";
        } else if (err.response.status === 500) {
          errorMessage =
            err.response.data?.detail ||
            "Server error. Please try again later.";
        } else {
          errorMessage =
            err.response.data?.detail ||
            err.response.data?.message ||
            errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      showToast(errorMessage, "error", 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayNamesShort = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Status Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <h3 className="font-semibold text-slate-900 text-xs">Status</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(STATUS_COLORS).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className={`w-2.5 h-2.5 rounded ${config.bg} ${config.border} border shrink-0`}
              />
              <span className="text-[10px] text-slate-700">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <CalendarIcon className="w-4 h-4 text-slate-900 shrink-0" />
            <span>Select Date</span>
          </h2>

          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors active:bg-slate-200"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="text-xs font-semibold text-slate-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded transition-colors active:bg-slate-200"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {dayNamesShort.map((day, index) => (
            <div
              key={`day-${index}`}
              className="text-center text-[10px] font-semibold text-slate-600 py-1"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateString = getLocalDateString(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day,
            );
            const isAvailable = isDateAvailable(day);
            const isSelected = selectedDate === dateString;
            const isPast = isDateInPast(day);

            return (
              <motion.button
                key={day}
                type="button"
                onClick={() => handleDateSelect(day)}
                disabled={!isAvailable || isPast}
                whileTap={isAvailable && !isPast ? { scale: 0.9 } : {}}
                className={`
                  aspect-square rounded flex items-center justify-center text-[11px] font-medium transition-all min-h-[32px]
                  ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-400"
                      : isAvailable && !isPast
                        ? "bg-emerald-50 text-emerald-700 active:bg-emerald-100 border border-emerald-200"
                        : isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-400 cursor-not-allowed bg-slate-50"
                  }
                `}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center justify-center gap-1 text-emerald-600"
          >
            <span className="text-[10px] font-medium">
              Scroll to view slots
            </span>
            <ChevronDown className="w-3 h-3 animate-bounce" />
          </motion.div>
        )}
      </div>

      {/* Time Slots */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            ref={slotsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-900 shrink-0" />
                <span>Select Time</span>
              </h2>
              {fetchingSlots && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px]">Updating...</span>
                </div>
              )}
            </div>

            {availableSlots.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <XCircle className="w-8 h-8 mx-auto mb-1.5 text-slate-400" />
                <p className="text-xs">No slots available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {availableSlots.map((slot) => {
                  const statusConfig = STATUS_COLORS[slot.status];
                  const isSelectable = slot.status === "FREE";
                  const isSelected = selectedSlotId === slot.id;
                  const isHeldByMe = slot.held_by_current_user;

                  return (
                    <motion.button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!isSelectable || holdingSlot}
                      whileTap={isSelectable ? { scale: 0.95 } : {}}
                      className={`
                        relative p-2 rounded border-2 transition-all font-medium text-[11px] min-h-[48px]
                        ${
                          isSelected && isHeldByMe
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : `${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${statusConfig.hover}`
                        }
                        ${!isSelectable ? "cursor-not-allowed opacity-60" : ""}
                      `}
                    >
                      <div className="leading-tight font-semibold">
                        {formatTime(slot.start_time)}
                      </div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        to {formatTime(slot.end_time)}
                      </div>
                      {slot.status !== "FREE" && !isHeldByMe && (
                        <div className="text-[9px] mt-0.5 opacity-75">
                          {statusConfig.label}
                        </div>
                      )}
                      {holdingSlot && isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Timer */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 p-2 rounded flex items-start gap-1.5 ${
                  timeRemaining < 60
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                } border`}
              >
                <Timer
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${timeRemaining < 60 ? "text-red-600" : "text-amber-600"}`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-semibold ${timeRemaining < 60 ? "text-red-900" : "text-amber-900"}`}
                  >
                    Reserved: {formatCountdown(timeRemaining)}
                  </p>
                  <p
                    className={`text-[9px] mt-0.5 ${timeRemaining < 60 ? "text-red-700" : "text-amber-700"}`}
                  >
                    {timeRemaining < 60
                      ? "⚠️ Expiring soon!"
                      : "Complete before timer expires"}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload */}
      <div
        ref={uploadRef}
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5"
      >
        <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-slate-900 shrink-0" />
          <span>Upload Report (Optional)</span>
        </h2>

        {!reportFile && (
          <div className="border-2 border-dashed border-slate-300 rounded p-3 text-center">
            <input
              type="file"
              id="report-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="report-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <FileText className="w-8 h-8 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-700">
                Click to upload
              </span>
              <span className="text-[9px] text-slate-500">
                {ALLOWED_FORMATS.display} (Max 5MB)
              </span>
            </label>
          </div>
        )}

        {reportFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded gap-1.5"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-900 truncate">
                  {reportFile.name}
                </p>
                <p className="text-[9px] text-slate-600">
                  {(reportFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReportFile(null)}
              className="p-1 hover:bg-emerald-100 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded p-2 flex items-start gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-800 leading-tight">{error}</p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
        <button
          type="submit"
          disabled={!selectedSlotId || submitting || !timeRemaining}
          className="w-full px-3 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-xs"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Send Request</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors font-medium text-xs"
        >
          Cancel
        </button>
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border border-blue-200 rounded p-2 flex items-start gap-1.5"
      >
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-blue-800 min-w-0 leading-tight">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Doctor reviews within 48 hours</li>
            <li>Email notification on response</li>
            <li>Payment needed upon approval</li>
            <li>Slot released after 48 hours if no action</li>
          </ul>
        </div>
      </motion.div>
    </form>
  );
}
