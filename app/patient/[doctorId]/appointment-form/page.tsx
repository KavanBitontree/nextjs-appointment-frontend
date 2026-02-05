import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppointmentFormPage from "@/components/patient/AppointmentFormPage";

interface Doctor {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  address: string;
  opd_fees: string | number;
  experience?: number;
  minimum_slot_duration?: string;
}

interface Slot {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "FREE" | "HELD" | "BOOKED" | "BLOCKED";
  held_until?: string;
  held_by_current_user?: boolean;
}

async function getDoctorDetails(doctorId: string, accessToken: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/doctors/${doctorId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch doctor details");
  }

  return response.json();
}

async function getDoctorSlots(doctorId: string, accessToken: string) {
  // Fetch slots for the next 30 days
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  const params = new URLSearchParams({
    doctor_id: doctorId,
    start_date: today.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    status: "FREE", // Only fetch available slots
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/patient/view/slots?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch doctor slots");
  }

  return response.json();
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const doctorId = resolvedParams.doctorId;

  try {
    const [doctorData, slotsData] = await Promise.all([
      getDoctorDetails(doctorId, accessToken),
      getDoctorSlots(doctorId, accessToken),
    ]);

    return (
      <AppointmentFormPage
        doctorId={parseInt(doctorId)}
        doctorData={doctorData}
        slotsData={slotsData.slots || []}
      />
    );
  } catch (error) {
    console.error("Error loading appointment page:", error);
    redirect("/patient/dashboard?error=failed_to_load");
  }
}
