import DoctorDashboard from "@/components/DoctorDashboard";
import { AuthGuard } from "@/context/AuthContext";

export default function DoctorDashboardPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorDashboard />
    </AuthGuard>
  );
}
