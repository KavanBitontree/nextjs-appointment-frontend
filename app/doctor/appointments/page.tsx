import DoctorAppointments from "@/components/doctor/DoctorAppointments";
import { AuthGuard } from "@/context/AuthContext";
import { AppointmentItem } from "@/lib/appointments_types";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorAppointmentsContent from "@/components/doctor/DoctorAppointmentsContent";

export const metadata = {
  title: "Appointments - Aarogya ABS",
  description: "Manage your appointments",
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
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <DoctorAppointmentsContent searchParams={searchParams} />
      </DoctorLayout>
    </AuthGuard>
  );
}
