export type SlotStatus = "FREE" | "HELD" | "BOOKED" | "BLOCKED";

export type DoctorSlotDTO = {
  id: number;
  doctor_id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: SlotStatus;
};

export type DoctorSlotsResponse = {
  total: number;
  slots: DoctorSlotDTO[];
};


