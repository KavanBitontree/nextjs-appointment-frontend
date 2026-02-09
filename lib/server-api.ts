import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ServerAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ServerAPIError";
  }
}

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
    throw new ServerAPIError(401, "Unauthorized - No access token");
  }

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
    cache: "no-store", // Always fetch fresh data
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ServerAPIError(
      response.status,
      errorData.detail || response.statusText,
      errorData,
    );
  }

  return response.json();
}

// ==================== TYPE DEFINITIONS ====================

type DashboardOverview = {
  doctor_id: number;
  doctor_name: string;
  speciality: string;
  opd_fees: number;
  quick_stats: {
    total_appointments_today: number;
    total_appointments_this_week: number;
    total_appointments_this_month: number;
    total_appointments_all_time: number;
    pending_approvals: number;
    upcoming_appointments: number;
    completed_this_month: number;
    revenue_today: number;
    revenue_this_week: number;
    revenue_this_month: number;
    revenue_all_time: number;
  };
};

type QuickStats = {
  total_appointments_today: number;
  total_appointments_this_week: number;
  total_appointments_this_month: number;
  total_appointments_all_time: number;
  pending_approvals: number;
  upcoming_appointments: number;
  completed_this_month: number;
  revenue_today: number;
  revenue_this_week: number;
  revenue_this_month: number;
  revenue_all_time: number;
};

type DailyRevenue = {
  date: string;
  total_revenue: number;
  completed_appointments: number;
};

type WeeklyRevenue = {
  week_start: string;
  week_end: string;
  total_revenue: number;
  completed_appointments: number;
  daily_breakdown: DailyRevenue[];
};

type MonthlyRevenue = {
  month: number;
  year: number;
  total_revenue: number;
  completed_appointments: number;
  weekly_breakdown: WeeklyRevenue[];
};

type RevenueAllTimeframes = {
  daily: DailyRevenue[];
  weekly: WeeklyRevenue[];
  monthly: MonthlyRevenue[];
};

type AppointmentStatusBreakdown = {
  total_appointments: number;
  requested: number;
  approved: number;
  rejected: number;
  paid: number;
  completed: number;
  cancelled: number;
  breakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
};

type AppointmentStatusAllPeriods = {
  all_time: AppointmentStatusBreakdown;
  this_month: AppointmentStatusBreakdown;
  this_week: AppointmentStatusBreakdown;
  today: AppointmentStatusBreakdown;
};

type LeaveStats = {
  month: number;
  year: number;
  total_days_in_month: number;
  working_days: number;
  leave_days: number;
  leave_percentage: number;
  leave_dates: string[];
};

type SlotPreference = {
  time_slot: string;
  start_time: string;
  end_time: string;
  total_bookings: number;
  completed_bookings: number;
  percentage_of_total: number;
};

type SlotPreferencesAll = {
  total_completed_appointments: number;
  slot_duration_hours: number;
  total_slots_per_day: number;
  preferences: SlotPreference[];
  most_popular_slot: SlotPreference | null;
  least_popular_slot: SlotPreference | null;
};

// ==================== DOCTOR ANALYTICS API ====================

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return serverFetch<DashboardOverview>("/doctor/analytics/dashboard");
}

export async function getQuickStats(): Promise<QuickStats> {
  return serverFetch<QuickStats>("/doctor/analytics/dashboard/quick-stats");
}

export async function getRevenueDailyList(params?: {
  start_date?: string;
  end_date?: string;
  days?: number;
}): Promise<DailyRevenue[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.set("start_date", params.start_date);
  if (params?.end_date) queryParams.set("end_date", params.end_date);
  if (params?.days) queryParams.set("days", params.days.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/doctor/analytics/revenue/daily?${queryString}`
    : "/doctor/analytics/revenue/daily";

  return serverFetch<DailyRevenue[]>(endpoint);
}

export async function getRevenueWeeklyList(params?: {
  start_date?: string;
  end_date?: string;
  weeks?: number;
}): Promise<WeeklyRevenue[]> {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.set("start_date", params.start_date);
  if (params?.end_date) queryParams.set("end_date", params.end_date);
  if (params?.weeks) queryParams.set("weeks", params.weeks.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/doctor/analytics/revenue/weekly?${queryString}`
    : "/doctor/analytics/revenue/weekly";

  return serverFetch<WeeklyRevenue[]>(endpoint);
}

export async function getRevenueMonthlyList(params?: {
  year?: number;
  months?: number;
}): Promise<MonthlyRevenue[]> {
  const queryParams = new URLSearchParams();
  if (params?.year) queryParams.set("year", params.year.toString());
  if (params?.months) queryParams.set("months", params.months.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/doctor/analytics/revenue/monthly?${queryString}`
    : "/doctor/analytics/revenue/monthly";

  return serverFetch<MonthlyRevenue[]>(endpoint);
}

export async function getRevenueAllTimeframes(params?: {
  daily_days?: number;
  weekly_weeks?: number;
  monthly_months?: number;
}): Promise<RevenueAllTimeframes> {
  const queryParams = new URLSearchParams();
  if (params?.daily_days)
    queryParams.set("daily_days", params.daily_days.toString());
  if (params?.weekly_weeks)
    queryParams.set("weekly_weeks", params.weekly_weeks.toString());
  if (params?.monthly_months)
    queryParams.set("monthly_months", params.monthly_months.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/doctor/analytics/revenue/all?${queryString}`
    : "/doctor/analytics/revenue/all";

  return serverFetch<RevenueAllTimeframes>(endpoint);
}

export async function getAppointmentStatusAllPeriods(): Promise<AppointmentStatusAllPeriods> {
  return serverFetch<AppointmentStatusAllPeriods>(
    "/doctor/analytics/appointments/status/all",
  );
}

export async function getAppointmentStatusToday(): Promise<AppointmentStatusBreakdown> {
  return serverFetch<AppointmentStatusBreakdown>(
    "/doctor/analytics/appointments/status/today",
  );
}

export async function getAppointmentStatusThisWeek(): Promise<AppointmentStatusBreakdown> {
  return serverFetch<AppointmentStatusBreakdown>(
    "/doctor/analytics/appointments/status/this-week",
  );
}

export async function getAppointmentStatusThisMonth(): Promise<AppointmentStatusBreakdown> {
  return serverFetch<AppointmentStatusBreakdown>(
    "/doctor/analytics/appointments/status/this-month",
  );
}

export async function getLeaveStatsCurrentMonth(): Promise<LeaveStats> {
  return serverFetch<LeaveStats>("/doctor/analytics/leave/current-month");
}

export async function getLeaveStatsForMonth(
  month: number,
  year: number,
): Promise<LeaveStats> {
  return serverFetch<LeaveStats>(
    `/doctor/analytics/leave/month?month=${month}&year=${year}`,
  );
}

export async function getSlotPreferencesAll(): Promise<SlotPreferencesAll> {
  return serverFetch<SlotPreferencesAll>(
    "/doctor/analytics/slots/preferences/all",
  );
}

export async function getMostPopularSlot(): Promise<SlotPreference> {
  return serverFetch<SlotPreference>(
    "/doctor/analytics/slots/preferences/most-popular",
  );
}
