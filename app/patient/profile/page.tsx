import PatientLayout from "@/components/patient/PatientLayout";
import { AuthGuard } from "@/context/AuthContext";
import PatientProfilePage from "@/components/patient/profile/PatientProfilePage";

export const metadata = {
  title: "Profile - Aarogya ABS",
  description: "View and manage your profile",
};

export default function ProfilePage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientProfilePage />
      </PatientLayout>
    </AuthGuard>
  );
}
