import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorAppointments from "@/components/doctor/DoctorAppointments";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "Doctor appointments history",
};

export default function DoctorAppointmentsPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorAppointments />
      </DoctorLayout>
    </AuthGuard>
  );
}


