import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorDashboardHome from "@/components/doctor/dashboard/DoctorDashboardHome";
import {
  getDashboardOverview,
  getRevenueAllTimeframes,
  getAppointmentStatusAllPeriods,
  getLeaveStatsCurrentMonth,
  getSlotPreferencesAll,
} from "@/lib/server-api";
import { redirect } from "next/navigation";

export default async function DoctorDashboardPage() {
  try {
    // Fetch all data in parallel on server
    const [
      dashboardOverview,
      revenueData,
      appointmentStatusData,
      leaveData,
      slotPreferences,
    ] = await Promise.all([
      getDashboardOverview(),
      getRevenueAllTimeframes({
        daily_days: 30,
        weekly_weeks: 4,
        monthly_months: 6,
      }),
      getAppointmentStatusAllPeriods(),
      getLeaveStatsCurrentMonth(),
      getSlotPreferencesAll(),
    ]);

    return (
      <AuthGuard allowedRoles={["doctor"]}>
        <DoctorLayout>
          <DoctorDashboardHome
            dashboardOverview={dashboardOverview}
            revenueData={revenueData}
            appointmentStatusData={appointmentStatusData}
            leaveData={leaveData}
            slotPreferences={slotPreferences}
          />
        </DoctorLayout>
      </AuthGuard>
    );
  } catch (error: any) {
    // If unauthorized, redirect to login
    if (error.status === 401) {
      redirect("/login");
    }

    // For other errors, show error page
    throw error;
  }
}
