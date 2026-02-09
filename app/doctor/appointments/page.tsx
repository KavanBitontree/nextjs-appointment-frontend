import DoctorAppointments from "@/components/doctor/DoctorAppointments";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { AuthGuard } from "@/context/AuthContext";
import { getDoctorAppointments } from "@/lib/appointments_api";
import { AppointmentItem } from "@/lib/appointments_api";

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
  // ✅ unwrap promise
  const params = await searchParams;

  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 10;
  const status = params.status ?? "";
  const search = params.search ?? "";

  let appointments: AppointmentItem[] = [];
  let total = 0;
  let totalPages = 1;
  let error: string | null = null;

  try {
    const response = await getDoctorAppointments({
      page,
      page_size: pageSize,
      status,
      search,
    });

    appointments = response.appointments;
    total = response.total;
    totalPages = response.total_pages ?? Math.ceil(total / pageSize);
  } catch (err: any) {
    error = err?.message || "Failed to load appointments";
    console.error("Error fetching appointments:", err);
  }

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error loading appointments</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          <DoctorAppointments
            initialAppointments={appointments}
            initialTotal={total}
            initialPage={page}
            initialPageSize={pageSize}
            initialTotalPages={totalPages}
          />
        )}
      </DoctorLayout>
    </AuthGuard>
  );
}
