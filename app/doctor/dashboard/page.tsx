import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorDashboardHome from "@/components/doctor/DoctorDashboardHome";

export default function DoctorDashboardPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorDashboardHome />
      </DoctorLayout>
    </AuthGuard>
  );
}
