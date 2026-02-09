import PatientAppointments from "@/components/patient/PatientAppointments";
import PatientLayout from "@/components/patient/PatientLayout";
import { AuthGuard } from "@/context/AuthContext";
import { getPatientAppointments } from "@/lib/appointments_api";
import type { AppointmentItem } from "@/lib/appointments_api";

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

export default async function AppointmentsPage({ searchParams }: PageProps) {
  // Await searchParams as it's now a Promise in Next.js 15+
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const pageSize = 10;
  const status = params.status || "";
  const search = params.search || "";

  let appointments: AppointmentItem[] = [];
  let total = 0;
  let totalPages = 1;
  let error = null;

  try {
    const response = await getPatientAppointments({
      page,
      page_size: pageSize,
      status,
      search,
    });

    appointments = response.appointments;
    total = response.total;
    totalPages = response.total_pages || Math.ceil(total / pageSize);
  } catch (err: any) {
    error = err.message || "Failed to load appointments";
    console.error("Error fetching appointments:", err);
  }

  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientLayout>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error loading appointments</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          <PatientAppointments
            initialAppointments={appointments}
            initialTotal={total}
            initialPage={page}
            initialPageSize={pageSize}
            initialTotalPages={totalPages}
          />
        )}
      </PatientLayout>
    </AuthGuard>
  );
}
