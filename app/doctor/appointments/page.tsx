import { Suspense } from "react";
import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorAppointmentsContent from "@/components/doctor/DoctorAppointmentsContent";
import AppointmentsSkeleton from "@/components/shared/AppointmentsSkeleton";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "Manage your appointments",
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <Suspense fallback={<AppointmentsSkeleton />}>
          <DoctorAppointmentsContent />
        </Suspense>
      </DoctorLayout>
    </AuthGuard>
  );
}
