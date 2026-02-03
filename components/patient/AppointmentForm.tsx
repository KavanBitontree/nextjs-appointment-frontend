"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

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

// ✅ FIX: Helper to get date string in YYYY-MM-DD format without timezone conversion
function getLocalDateString(year: number, month: number, day: number): string {
  const yyyy = year.toString();
  const mm = (month + 1).toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ FIX: Helper to parse YYYY-MM-DD string to local date components
function parseDateString(dateString: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month: month - 1, day }; // month is 0-indexed
}

export default function AppointmentForm({
  doctorId,
  doctorName,
  slots: initialSlots,
  opdFees,
}: AppointmentFormProps) {
  const router = useRouter();
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

  // Group slots by date
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

  // Get dates that have FREE slots only
  const datesWithFreeSlots = useMemo(() => {
    return Object.keys(slotsByDate).filter((date) => {
      return slotsByDate[date].some((slot) => slot.status === "FREE");
    });
  }, [slotsByDate]);

  // Get slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return (slotsByDate[selectedDate] || []).sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );
  }, [selectedDate, slotsByDate]);

  // Countdown timer for held slot
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
        // Slot expired
        setHeldSlotExpiry(null);
        setSelectedSlotId(null);
        setError(
          "Your slot reservation has expired. Please select another slot.",
        );
        // Refresh slots for the selected date
        if (selectedDate) {
          fetchSlotsForDate(selectedDate);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [heldSlotExpiry, selectedDate]);

  // Fetch fresh slots for a specific date
  const fetchSlotsForDate = useCallback(
    async (date: string) => {
      setFetchingSlots(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          doctor_id: doctorId.toString(),
          date: date, // Send YYYY-MM-DD string directly
        });

        // ✅ FIX: Use the by-date endpoint for single date queries
        const response = await api.get(
          `/patient/slots/by-date?${params.toString()}`,
        );

        // Update slots for this date
        setSlots((prevSlots) => {
          const otherDateSlots = prevSlots.filter((s) => s.date !== date);
          return [...otherDateSlots, ...(response.data.slots || [])];
        });
      } catch (err: any) {
        console.error("Error fetching slots:", err);
        setError("Failed to fetch available slots. Please try again.");
      } finally {
        setFetchingSlots(false);
      }
    },
    [doctorId],
  );

  // Hold a slot when selected
  const holdSlot = useCallback(
    async (slotId: number) => {
      setHoldingSlot(true);
      setError(null);

      try {
        const response = await api.post(`/patient/slots/${slotId}/hold`);

        // Update the slot in state
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

        // Set expiry timer
        setHeldSlotExpiry(new Date(response.data.held_until));
        setTimeRemaining(response.data.time_remaining_seconds);

        return true;
      } catch (err: any) {
        console.error("Error holding slot:", err);

        if (err.response?.status === 409) {
          setError(
            "This slot was just booked by someone else. Please select another slot.",
          );
          // Refresh slots to show updated status
          const slotDate = slots.find((s) => s.id === slotId)?.date;
          if (slotDate) {
            await fetchSlotsForDate(slotDate);
          }
        } else {
          setError("Failed to reserve this slot. Please try again.");
        }

        setSelectedSlotId(null);
        return false;
      } finally {
        setHoldingSlot(false);
      }
    },
    [slots, fetchSlotsForDate],
  );

  // Release held slot
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

  // Calendar helpers
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

  // ✅ FIX: Check if date is available without timezone conversion
  const isDateAvailable = (day: number) => {
    const dateString = getLocalDateString(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return datesWithFreeSlots.includes(dateString);
  };

  // ✅ FIX: Check if date is in the past without timezone conversion
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

  // ✅ FIX: Handle date selection without timezone conversion
  const handleDateSelect = async (day: number) => {
    const dateString = getLocalDateString(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    if (isDateAvailable(day) && !isDateInPast(day)) {
      // Release any currently held slot
      if (selectedSlotId) {
        const slot = slots.find((s) => s.id === selectedSlotId);
        if (slot?.held_by_current_user) {
          await releaseSlot(selectedSlotId);
        }
      }

      setSelectedDate(dateString);
      setSelectedSlotId(null);

      // Fetch fresh slots for this date
      await fetchSlotsForDate(dateString);
    }
  };

  const handleSlotSelect = async (slot: Slot) => {
    if (slot.status !== "FREE") return;

    // Release previously held slot if different
    if (selectedSlotId && selectedSlotId !== slot.id) {
      const prevSlot = slots.find((s) => s.id === selectedSlotId);
      if (prevSlot?.held_by_current_user) {
        await releaseSlot(selectedSlotId);
      }
    }

    setSelectedSlotId(slot.id);

    // Try to hold the slot
    await holdSlot(slot.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF or image file (JPEG, PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
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
      return;
    }

    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot?.held_by_current_user) {
      setError("Please hold a slot before booking");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("doctor_id", doctorId.toString());
      formData.append("slot_id", selectedSlotId.toString());

      if (reportFile) {
        formData.append("report", reportFile);
      }

      await api.post("/patient/appointments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/patient/dashboard?booking=success");
    } catch (err: any) {
      console.error("Error submitting appointment:", err);

      if (err.response?.status === 409) {
        setError(
          "This slot is no longer available. Please select another slot.",
        );
        // Refresh slots
        if (selectedDate) {
          await fetchSlotsForDate(selectedDate);
        }
        setSelectedSlotId(null);
      } else {
        setError(
          err.response?.data?.detail || "Failed to submit appointment request",
        );
      }
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Legend */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Slot Status Guide</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS_COLORS).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded ${config.bg} ${config.border} border-2`}
              ></div>
              <span className="text-sm text-slate-700">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Calendar */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-slate-900" />
            Select Date
          </h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <span className="text-lg font-semibold text-slate-900 min-w-[180px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-slate-600 py-2"
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
                whileHover={isAvailable && !isPast ? { scale: 1.05 } : {}}
                whileTap={isAvailable && !isPast ? { scale: 0.95 } : {}}
                className={`
                  aspect-square rounded-lg p-2 text-sm font-medium transition-all
                  ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-lg ring-2 ring-slate-400"
                      : isAvailable && !isPast
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200"
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
      </div>

      {/* Time Slots */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-slate-900" />
                Select Time Slot
              </h2>
              {fetchingSlots && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Updating slots...</span>
                </div>
              )}
            </div>

            {availableSlots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <XCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No slots available for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                      whileHover={isSelectable ? { scale: 1.02 } : {}}
                      whileTap={isSelectable ? { scale: 0.98 } : {}}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all font-medium
                        ${
                          isSelected && isHeldByMe
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                            : `${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${statusConfig.hover}`
                        }
                        ${!isSelectable ? "cursor-not-allowed opacity-60" : ""}
                      `}
                    >
                      <div className="text-sm">
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </div>
                      {slot.status !== "FREE" && !isHeldByMe && (
                        <div className="text-xs mt-1 opacity-75">
                          {statusConfig.label}
                        </div>
                      )}
                      {holdingSlot && isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                          <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Countdown Timer */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                  timeRemaining < 60
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                } border-2`}
              >
                <Timer
                  className={`w-5 h-5 ${timeRemaining < 60 ? "text-red-600" : "text-amber-600"}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${timeRemaining < 60 ? "text-red-900" : "text-amber-900"}`}
                  >
                    Slot Reserved for {formatCountdown(timeRemaining)}
                  </p>
                  <p
                    className={`text-xs ${timeRemaining < 60 ? "text-red-700" : "text-amber-700"}`}
                  >
                    {timeRemaining < 60
                      ? "⚠️ Hurry! Your reservation is expiring soon"
                      : "Complete your booking before the timer expires"}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Upload */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-slate-900" />
          Upload Medical Report (Optional)
        </h2>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
            <input
              type="file"
              id="report-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="report-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="w-12 h-12 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-slate-500">
                PDF or Image (Max 5MB)
              </span>
            </label>
          </div>

          {reportFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {reportFile.name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {(reportFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportFile(null)}
                className="p-1 hover:bg-emerald-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!selectedSlotId || submitting || !timeRemaining}
          className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirming Booking...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Confirm Appointment
            </>
          )}
        </button>
      </div>
    </form>
  );
}
