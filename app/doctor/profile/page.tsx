import DoctorLayout from "@/components/doctor/DoctorLayout";
import { AuthGuard } from "@/context/AuthContext";
import DoctorProfilePage from "@/components/doctor/profile/DoctorProfilePage";

export const metadata = {
  title: "Profile - Aarogya ABS",
  description: "View and manage your professional profile",
};

export default function ProfilePage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorProfilePage />
      </DoctorLayout>
    </AuthGuard>
  );
}
