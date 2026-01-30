import { Suspense } from "react";
import PatientLayout from "@/components/patient/PatientLayout";
import ShowDoctorsClient from "@/components/patient/ShowDoctorsClient";
import { AuthGuard } from "@/context/AuthContext";

export const metadata = {
  title: "Doctors - Aarogya ABS",
  description: "Find and book doctors",
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search_name?: string;
    search_address?: string;
    filter_speciality?: string;
    sort_by?: string;
    sort_order?: string;
    skip?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <Suspense fallback={<div>Loading doctors...</div>}>
          <ShowDoctorsClient initialData={null} searchParams={params} />
        </Suspense>
      </PatientLayout>
    </AuthGuard>
  );
}
