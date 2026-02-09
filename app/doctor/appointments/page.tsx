import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorAppointmentsContent from "@/components/doctor/DoctorAppointmentsContent";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "Manage your appointments",
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorAppointmentsContent />
      </DoctorLayout>
    </AuthGuard>
  );
}
