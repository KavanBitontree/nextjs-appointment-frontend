/**
 * Appointments API Client
 * Server-side only - uses fetch with cookies from Next.js
 */

import { cookies } from "next/headers";
import type {
  AppointmentStatus,
  TimeRemaining,
  AppointmentItem,
  AppointmentsResponse,
  AppointmentActionResponse,
  PaginationParams,
  FilterParams,
} from "./appointments_types";

// Re-export types for convenience
export type {
  AppointmentStatus,
  TimeRemaining,
  AppointmentItem,
  AppointmentsResponse,
  AppointmentActionResponse,
  PaginationParams,
  FilterParams,
};
export { AppointmentStatus as AppointmentStatusEnum } from "./appointments_types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== API ERROR CLASS ====================

class AppointmentsAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "AppointmentsAPIError";
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Build query string from filter params
 */
function buildQueryString(params: FilterParams): string {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.append("status", params.status);
  }
  if (params.search) {
    searchParams.append("search", params.search);
  }
  if (params.page) {
    searchParams.append("page", params.page.toString());
  }
  if (params.page_size) {
    searchParams.append("page_size", params.page_size.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Server-side fetch helper
 * Directly calls backend with cookies from Next.js cookies() function
 * Cookies are accessible server-side via cookies() when called from server components/API routes
 */
async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;

  // If no access token, try to refresh using refresh token
  if (!accessToken) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (refreshToken) {
      try {
        // Try to refresh the access token
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refresh_token=${refreshToken}`,
          },
          cache: "no-store",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
        }
      } catch (error) {
        console.error("Failed to refresh token in serverFetch:", error);
      }
    }
  }

  if (!accessToken) {
    throw new AppointmentsAPIError(401, "Unauthorized - No access token");
  }

  // Directly call backend - cookies() gives us access to cookies set by backend
  const url = `${API_BASE_URL}${endpoint}`;

  // Forward all cookies to backend
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppointmentsAPIError(
      response.status,
      errorData.detail || response.statusText,
      errorData,
    );
  }

  return response.json();
}

/**
 * Server-side fetch helper for FormData
 */
async function serverFetchFormData<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new AppointmentsAPIError(401, "Unauthorized - No access token");
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppointmentsAPIError(
      response.status,
      errorData.detail || response.statusText,
      errorData,
    );
  }

  return response.json();
}

// ==================== PATIENT API FUNCTIONS ====================

/**
 * Get patient's appointments with optional filtering
 */
export async function getPatientAppointments(
  filters: FilterParams = {},
): Promise<AppointmentsResponse> {
  const queryString = buildQueryString(filters);
  const endpoint = `/appointments/my-appointments${queryString}`;
  return serverFetch<AppointmentsResponse>(endpoint);
}

/**
 * Request a new appointment (patient side)
 */
export async function requestAppointment(
  slotId: number,
  report?: File,
): Promise<AppointmentActionResponse> {
  const formData = new FormData();
  formData.append("slot_id", slotId.toString());
  if (report) {
    formData.append("report", report);
  }

  return serverFetchFormData<AppointmentActionResponse>(
    "/appointments/request",
    formData,
  );
}

/**
 * Cancel an appointment (patient side)
 */
export async function cancelAppointment(
  appointmentId: number,
): Promise<AppointmentActionResponse> {
  return serverFetch<AppointmentActionResponse>(
    `/appointments/${appointmentId}/cancel-patient`,
    { method: "POST" },
  );
}

/**
 * Get appointment payment details
 */
export async function getAppointmentPaymentDetails(
  appointmentId: number,
  token?: string,
): Promise<{
  appointment_id: number;
  doctor_name: string;
  specialization: string;
  opd_fees: number;
  slot_date: string;
  slot_time: string;
  time_remaining?: TimeRemaining;
  payment_expires_at?: string;
}> {
  const endpoint = token
    ? `/appointments/${appointmentId}/payment-details?token=${token}`
    : `/appointments/${appointmentId}/payment-details`;

  return serverFetch(endpoint);
}

// ==================== DOCTOR API FUNCTIONS ====================

/**
 * Get doctor's appointments with optional filtering
 */
export async function getDoctorAppointments(
  filters: FilterParams = {},
): Promise<AppointmentsResponse> {
  const queryString = buildQueryString(filters);
  const endpoint = `/appointments/doctor-appointments${queryString}`;
  return serverFetch<AppointmentsResponse>(endpoint);
}

/**
 * Approve an appointment (doctor side)
 */
export async function approveAppointment(
  appointmentId: number,
  token?: string,
): Promise<AppointmentActionResponse> {
  const endpoint = token
    ? `/appointments/${appointmentId}/approve?token=${token}`
    : `/appointments/${appointmentId}/approve`;

  return serverFetch<AppointmentActionResponse>(endpoint, { method: "POST" });
}

/**
 * Reject an appointment (doctor side)
 */
export async function rejectAppointment(
  appointmentId: number,
  reason: string,
  token?: string,
): Promise<AppointmentActionResponse> {
  const endpoint = token
    ? `/appointments/${appointmentId}/reject?token=${token}`
    : `/appointments/${appointmentId}/reject`;

  return serverFetch<AppointmentActionResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ==================== EXPORT ALL ====================

export const appointmentsApi = {
  // Patient
  getPatientAppointments,
  requestAppointment,
  cancelAppointment,
  getAppointmentPaymentDetails,

  // Doctor
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
};
