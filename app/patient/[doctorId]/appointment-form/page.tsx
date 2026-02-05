import AppointmentFormRoute from "@/components/patient/AppointmentFormRoute";

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const resolvedParams = await params;
  const doctorId = parseInt(resolvedParams.doctorId, 10);

  return <AppointmentFormRoute doctorId={doctorId} />;
}
