import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorDashboardContent from "@/components/doctor/dashboard/DoctorDashboardContent";

export const metadata = {
  title: "Dashboard - Aarogya ABS",
  description: "Doctor Dashboard",
};

export default function DoctorDashboardPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorDashboardContent />
      </DoctorLayout>
    </AuthGuard>
  );
}
