import { Suspense } from "react";
import { AuthGuard } from "@/context/AuthContext";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorDashboardContent from "@/components/doctor/dashboard/DoctorDashboardContent";
import DoctorDashboardSkeleton from "@/components/doctor/dashboard/DoctorDashboardSkeleton";

export const metadata = {
  title: "Dashboard - Aarogya ABS",
  description: "Doctor Dashboard",
};

export default function DoctorDashboardPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <Suspense fallback={<DoctorDashboardSkeleton />}>
          <DoctorDashboardContent />
        </Suspense>
      </DoctorLayout>
    </AuthGuard>
  );
}
