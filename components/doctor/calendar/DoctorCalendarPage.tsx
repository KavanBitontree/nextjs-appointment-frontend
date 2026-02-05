"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  getMonthGridDays,
  isSameDay,
  toISODate,
} from "./date";
import type { DoctorSlotDTO } from "./types";
import {
  Loader,
  CheckCircle,
  Lock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  blockSlot,
  createSlotsForDate,
  fetchDoctorSlots,
  setDateOff,
  setLeaveRange,
  setRecurringSundaysOff,
  unblockSlot,
} from "./api";

function groupSlotsByDate(slots: DoctorSlotDTO[]) {
  const map = new Map<string, DoctorSlotDTO[]>();
  for (const s of slots) {
    const arr = map.get(s.date) ?? [];
    arr.push(s);
    map.set(s.date, arr);
  }
  // ensure stable ordering
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => a.start_time.localeCompare(b.start_time));
    map.set(k, arr);
  }
  return map;
}

function pad2(n: number) {
  return `${n}`.padStart(2, "0");
}

function humanTime(t: string) {
  // "HH:MM:SS" -> "HH:MM"
  const [hh, mm] = t.split(":");
  return `${hh}:${mm}`;
}

export default function DoctorCalendarPage() {
  const { showToast } = useToast();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<DoctorSlotDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sundaysWeeks, setSundaysWeeks] = useState(8);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [createStartTime, setCreateStartTime] = useState("09:00");
  const [createEndTime, setCreateEndTime] = useState("17:00");

  const [busyKey, setBusyKey] = useState<string | null>(null);

  const { start, end, days } = useMemo(() => getMonthGridDays(month), [month]);
  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots]);

  const selectedISO = useMemo(() => toISODate(selectedDay), [selectedDay]);
  const selectedSlots = slotsByDate.get(selectedISO) ?? [];

  const minEditableDate = useMemo(() => {
    const today = new Date();
    // strip time
    const base = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return addDays(base, 1);
  }, []);

  const isDateEditable = (d: Date) => {
    const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dayOnly >= minEditableDate;
  };

  const selectedEditable = isDateEditable(selectedDay);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we fetch the selected day's data even if it's outside current month view
      const selectedDayStripped = new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate(),
      );
      const fetchStart =
        start < selectedDayStripped ? start : selectedDayStripped;
      const fetchEnd = end > selectedDayStripped ? end : selectedDayStripped;

      const data = await fetchDoctorSlots({
        start_date: toISODate(fetchStart),
        end_date: toISODate(fetchEnd),
      });
      setSlots(data.slots);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load calendar slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month.getFullYear(), month.getMonth(), selectedDay]);

  // Background refresh every 30 seconds to catch any changes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, selectedDay]);

  const isBusy = (key: string) => busyKey === key;

  const onToggleSlot = async (slot: DoctorSlotDTO) => {
    setError(null);
    const key = `slot:${slot.id}`;
    setBusyKey(key);

    const originalStatus = slot.status;
    const newStatus = slot.status === "FREE" ? "BLOCKED" : "FREE";

    try {
      // Optimistic update
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id
            ? { ...s, status: newStatus as DoctorSlotDTO["status"] }
            : s,
        ),
      );

      // Make API call
      if (originalStatus === "FREE") {
        await blockSlot(slot.id);
        showToast("Slot blocked", "success");
      } else if (originalStatus === "BLOCKED") {
        await unblockSlot(slot.id);
        showToast("Slot unblocked", "success");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Failed to update slot";
      setError(msg);
      showToast(msg, "error");

      // Revert optimistic update on error
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slot.id ? { ...s, status: originalStatus } : s,
        ),
      );
    } finally {
      setBusyKey(null);
    }
  };

  const onDateOff = async () => {
    setError(null);
    setBusyKey("dateOff");
    try {
      await setDateOff({ date: selectedISO });
      showToast("Date marked off", "success");

      // Optimistic update: mark all slots as BLOCKED for this date
      setSlots((prev) =>
        prev.map((s) =>
          s.date === selectedISO
            ? { ...s, status: "BLOCKED" as DoctorSlotDTO["status"] }
            : s,
        ),
      );
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Failed to mark date off";
      setError(msg);
      showToast(msg, "error");
      await refetch();
    } finally {
      setBusyKey(null);
    }
  };

  const onSundaysOff = async () => {
    setError(null);
    setBusyKey("sundaysOff");
    try {
      const startISO = toISODate(new Date());
      await setRecurringSundaysOff({
        start_date: startISO,
        weeks: sundaysWeeks,
      });
      showToast("Recurring Sundays off applied", "success");
      await refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Failed to set Sundays off";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const onLeaveRange = async () => {
    setError(null);
    setBusyKey("leaveRange");
    try {
      if (!leaveStart || !leaveEnd) {
        const msg = "Please select both leave start and end dates";
        setError(msg);
        showToast(msg, "error");
        return;
      }
      await setLeaveRange({ start_date: leaveStart, end_date: leaveEnd });
      showToast("Leave applied", "success");
      await refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Failed to set leave range";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const onCreateSlots = async () => {
    setError(null);
    setBusyKey("createSlots");
    try {
      await createSlotsForDate({
        date: selectedISO,
        start_time: createStartTime,
        end_time: createEndTime,
      });
      showToast("Slots created", "success");
      await refetch();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Failed to create slots";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const daySummary = (iso: string) => {
    const daySlots = slotsByDate.get(iso) ?? [];
    if (!daySlots.length) return { free: 0, blocked: 0, booked: 0, held: 0 };
    const sum = { free: 0, blocked: 0, booked: 0, held: 0 };
    for (const s of daySlots) {
      if (s.status === "FREE") sum.free += 1;
      if (s.status === "BLOCKED") sum.blocked += 1;
      if (s.status === "BOOKED") sum.booked += 1;
      if (s.status === "HELD") sum.held += 1;
    }
    return sum;
  };

  const monthLabel = useMemo(() => {
    const m = month.toLocaleString(undefined, { month: "long" });
    return `${m} ${month.getFullYear()}`;
  }, [month]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-2 sm:p-4 md:p-6 min-h-screen bg-slate-50">
      <div className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-4 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">
              Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 line-clamp-2">
              Manage slots, full-day off, recurring Sundays, and leave ranges.
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
            <button
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={() => setMonth(addMonths(month, -1))}
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 text-center min-w-fit px-2 flex-shrink-0">
              {monthLabel}
            </div>
            <button
              className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center flex-shrink-0"
              onClick={() => setMonth(addMonths(month, 1))}
              title="Next month"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 rounded-lg sm:rounded-xl border border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-700">Free</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-700">Blocked</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-slate-700">Booked</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2 mb-2 text-[10px] sm:text-xs font-semibold text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="px-1 text-center h-6 sm:h-8 flex items-center justify-center flex-shrink-0"
            >
              <span className="hidden sm:inline truncate">{d}</span>
              <span className="sm:hidden truncate">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
          {days.map((d) => {
            const iso = toISODate(d);
            const inMonth = d.getMonth() === month.getMonth();
            const selected = isSameDay(d, selectedDay);
            const sum = daySummary(iso);
            const hasSlots = sum.free + sum.blocked + sum.booked + sum.held > 0;
            const editable = isDateEditable(d);

            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(d)}
                className={[
                  "min-h-20 sm:h-24 rounded-lg sm:rounded-xl border text-left p-1.5 sm:p-2 transition-colors text-xs sm:text-sm flex flex-col",
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:bg-slate-50 bg-white",
                  !inMonth ? "opacity-50" : "",
                  !editable ? "opacity-40 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-1 flex-shrink-0 mb-1">
                  <div className="text-xs sm:text-sm font-semibold flex-shrink-0">
                    {pad2(d.getDate())}
                  </div>
                  {d.getDay() === 0 && (
                    <div
                      className={[
                        "text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap",
                        selected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      Sun
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-1 text-[9px] sm:text-[11px]">
                  {!hasSlots ? (
                    <div
                      className={`${selected ? "text-white/80" : "text-slate-500"} truncate`}
                    >
                      No slots
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap gap-y-1">
                      {sum.free > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <CheckCircle
                            className={`w-3 h-3 ${selected ? "text-white" : "text-green-600"} flex-shrink-0`}
                          />
                          <span className="font-semibold">{sum.free}</span>
                        </div>
                      )}
                      {sum.blocked > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Lock
                            className={`w-3 h-3 ${selected ? "text-white/70" : "text-gray-500"} flex-shrink-0`}
                          />
                          <span className="font-semibold">{sum.blocked}</span>
                        </div>
                      )}
                      {sum.booked > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Calendar
                            className={`w-3 h-3 ${selected ? "text-white" : "text-red-600"} flex-shrink-0`}
                          />
                          <span className="font-semibold">{sum.booked}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-4 text-xs sm:text-sm text-slate-600">
            Loading slots…
          </div>
        )}
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 flex flex-col h-fit lg:h-auto">
        <div>
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {selectedISO}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                Toggle FREE ↔ BLOCKED slots, or mark whole day off.
              </p>
              {!selectedEditable && (
                <p className="mt-1 text-xs text-amber-600">
                  Editing is disabled for dates earlier than tomorrow.
                </p>
              )}
            </div>
            <button
              onClick={onDateOff}
              disabled={isBusy("dateOff") || !selectedEditable}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {isBusy("dateOff") ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : (
                "Mark date off"
              )}
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-200 rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden">
            {selectedSlots.length === 0 ? (
              <div className="p-3 sm:p-4 space-y-3">
                <div className="text-xs sm:text-sm text-slate-600">
                  No slots found for this date. Create slots to make the day
                  bookable.
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <label className="block text-xs text-slate-600 mb-1">
                      Start time
                    </label>
                    <input
                      type="time"
                      value={createStartTime}
                      onChange={(e) => setCreateStartTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs text-slate-600 mb-1">
                      End time
                    </label>
                    <input
                      type="time"
                      value={createEndTime}
                      onChange={(e) => setCreateEndTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={onCreateSlots}
                  disabled={isBusy("createSlots") || !selectedEditable}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isBusy("createSlots") ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span>Creating...</span>
                    </span>
                  ) : (
                    "Create slots"
                  )}
                </button>
              </div>
            ) : (
              selectedSlots.map((s) => {
                const canToggle = s.status === "FREE" || s.status === "BLOCKED";
                const slotBusy = isBusy(`slot:${s.id}`);
                return (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 gap-2 sm:gap-0"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        {humanTime(s.start_time)} - {humanTime(s.end_time)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-600">
                        Status: {s.status}
                      </div>
                    </div>
                    <button
                      disabled={!canToggle || slotBusy || !selectedEditable}
                      onClick={() => onToggleSlot(s)}
                      className={[
                        "px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm border whitespace-nowrap w-full sm:w-auto",
                        canToggle && selectedEditable
                          ? "border-slate-200 hover:bg-slate-50"
                          : "border-slate-100 text-slate-400 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {slotBusy ? (
                        <span className="inline-flex items-center gap-2 justify-center">
                          <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          <span>Updating...</span>
                        </span>
                      ) : s.status === "FREE" ? (
                        "Block"
                      ) : s.status === "BLOCKED" ? (
                        "Unblock"
                      ) : (
                        "Locked"
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
            Recurring Sundays off
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-600 mb-1">
                  Weeks
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={sundaysWeeks}
                  onChange={(e) => setSundaysWeeks(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm"
                />
              </div>
              <button
                onClick={onSundaysOff}
                disabled={isBusy("sundaysOff")}
                className="px-3 sm:px-4 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isBusy("sundaysOff") ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Applying...</span>
                  </span>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-[10px] sm:text-xs text-slate-500">
            This will mark upcoming Sundays as off for the next N weeks.
          </p>
        </div>

        <div className="rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
            Leave range
          </h3>
          <div className="flex flex-col gap-2 sm:gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Start date
              </label>
              <input
                type="date"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                min={toISODate(minEditableDate)}
                className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                End date
              </label>
              <input
                type="date"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                min={toISODate(minEditableDate)}
                className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm"
              />
            </div>
          </div>
          <button
            onClick={onLeaveRange}
            disabled={isBusy("leaveRange")}
            className="mt-3 w-full px-2 sm:px-3 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy("leaveRange") ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span>Applying...</span>
              </span>
            ) : (
              "Apply leave"
            )}
          </button>
          <p className="mt-2 text-[10px] sm:text-xs text-slate-500">
            Continuous sequence of days will be marked off.
          </p>
        </div>
      </div>
    </div>
  );
}
