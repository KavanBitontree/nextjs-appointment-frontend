import PatientAppointments from "@/components/patient/PatientAppointments";
import { AuthGuard } from "@/context/AuthContext";
import PatientLayout from "@/components/patient/PatientLayout";
import PatientAppointmentsContent from "@/components/patient/PatientAppointmentsContent";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "View your appointments",
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
};

export default function AppointmentsPage({ searchParams }: PageProps) {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        <PatientAppointmentsContent searchParams={searchParams} />
      </PatientLayout>
    </AuthGuard>
  );
}
