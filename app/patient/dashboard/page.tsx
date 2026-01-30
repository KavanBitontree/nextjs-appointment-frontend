import PatientDashboard from "@/components/patient/PatientDashboard";
import PatientLayout from "@/components/patient/PatientLayout";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Dashboard - Aarogya ABS",
  description: "Patient Dashboard",
};

export default function PatientDashboardPage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientDashboard />
      </PatientLayout>
    </AuthGuard>
  );
}
