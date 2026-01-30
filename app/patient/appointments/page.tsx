import PatientAppointments from "@/components/patient/PatientAppointments";
import PatientLayout from "@/components/patient/PatientLayout";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "View your appointments",
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientAppointments />
      </PatientLayout>
    </AuthGuard>
  );
}
