import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorCalendarPage from "@/components/doctor/calendar/DoctorCalendarPage";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Calendar - Aarogya ABS",
  description: "Doctor calendar and slot management",
};

export default function DoctorCalendarRoute() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorCalendarPage />
      </DoctorLayout>
    </AuthGuard>
  );
}


