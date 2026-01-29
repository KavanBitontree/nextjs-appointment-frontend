import PatientProfile from "@/components/patient/PatientProfile";
import PatientLayout from "@/components/patient/PatientLayout";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Profile - Aarogya ABS",
  description: "View and manage your profile",
};

export default async function ProfilePage() {
  // The client component will handle fetching patient data using the auth context
  // since server components don't have access to user-specific data
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientProfile initialData={null} />
      </PatientLayout>
    </AuthGuard>
  );
}
