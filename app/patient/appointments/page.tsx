import { Suspense } from "react";
import { AuthGuard } from "@/context/AuthContext";
import PatientLayout from "@/components/patient/PatientLayout";
import PatientAppointmentsContent from "@/components/patient/PatientAppointmentsContent";
import AppointmentsSkeleton from "@/components/shared/AppointmentsSkeleton";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "View your appointments",
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <Suspense fallback={<AppointmentsSkeleton />}>
          <PatientAppointmentsContent />
        </Suspense>
      </PatientLayout>
    </AuthGuard>
  );
}
