/**
 * Appointments Type Definitions
 * Can be imported in both Server and Client Components
 */

// ==================== TYPE DEFINITIONS ====================

export enum AppointmentStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export type TimeRemaining = {
  hours?: number;
  minutes: number;
  seconds?: number;
  expires_at: string;
};

export type AppointmentItem = {
  id: number;
  status: AppointmentStatus;
  doctor_name: string;
  specialization: string;
  slot_date: string;
  slot_time: string;
  created_at: string;
  approval_time_remaining?: TimeRemaining;
  payment_time_remaining?: TimeRemaining;
  opd_fees: number;
  patient_name?: string; // For doctor view
  patient_contact?: string; // For doctor view
  report?: string; // Cloudinary URL
};

export type AppointmentsResponse = {
  total: number;
  appointments: AppointmentItem[];
  page?: number;
  page_size?: number;
  total_pages?: number;
};

export type AppointmentActionResponse = {
  appointment_id: number;
  status: string;
  message: string;
  payment_url?: string;
  reason?: string;
};

export type PaginationParams = {
  page?: number;
  page_size?: number;
};

export type FilterParams = {
  status?: AppointmentStatus | string;
  search?: string;
} & PaginationParams;
