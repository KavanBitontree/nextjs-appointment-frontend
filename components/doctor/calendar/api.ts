"use client";

import { api } from "@/lib/axios";
import type { DoctorSlotsResponse } from "./types";

export async function fetchDoctorSlots(params: {
  start_date: string;
  end_date: string;
}) {
  const { data } = await api.get<DoctorSlotsResponse>(
    "/doctor/availability/slots",
    { params },
  );
  return data;
}

export async function blockSlot(slotId: number) {
  const { data } = await api.post(`/doctor/availability/slots/${slotId}/block`);
  return data;
}

export async function unblockSlot(slotId: number) {
  const { data } = await api.post(
    `/doctor/availability/slots/${slotId}/unblock`,
  );
  return data;
}

export async function setDateOff(payload: { date: string }) {
  const { data } = await api.post("/doctor/calendar/date-off", payload);
  return data;
}

export async function setRecurringSundaysOff(payload: {
  start_date: string;
  weeks: number;
}) {
  const { data } = await api.post(
    "/doctor/calendar/recurring-sundays-off",
    payload,
  );
  return data;
}

export async function setLeaveRange(payload: {
  start_date: string;
  end_date: string;
}) {
  const { data } = await api.post("/doctor/calendar/leave-range", payload);
  return data;
}

export async function createSlotsForDate(payload: {
  date: string;
  start_time: string;
  end_time: string;
}) {
  const { data } = await api.post(
    "/doctor/availability/date-slots/create",
    payload,
  );
  return data;
}
