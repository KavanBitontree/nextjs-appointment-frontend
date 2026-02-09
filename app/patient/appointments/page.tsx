import { AuthGuard } from "@/context/AuthContext";
import PatientLayout from "@/components/patient/PatientLayout";
import PatientAppointmentsContent from "@/components/patient/PatientAppointmentsContent";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "View your appointments",
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientAppointmentsContent />
      </PatientLayout>
    </AuthGuard>
  );
}
