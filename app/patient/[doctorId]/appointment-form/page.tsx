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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/doctors/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(
        `[appointment-page] Doctor fetch failed: ${response.status} ${response.statusText}`,
      );
      throw new Error(`Failed to fetch doctor details: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("[appointment-page] Doctor fetch error:", error);
    throw error;
  }
}

async function getDoctorSlots(doctorId: string, accessToken: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  const params = new URLSearchParams({
    doctor_id: doctorId,
    start_date: today.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    status: "FREE",
  });

  try {
    const response = await fetch(
      `${apiUrl}/patient/view/slots?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    );

    if (!response.ok) {
      console.error(
        `[appointment-page] Slots fetch failed: ${response.status} ${response.statusText}`,
      );
      throw new Error(`Failed to fetch doctor slots: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("[appointment-page] Slots fetch error:", error);
    throw error;
  }
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    console.warn(
      "[appointment-page] No access token found, redirecting to login",
    );
    redirect("/login");
  }

  const resolvedParams = await params;
  const doctorId = resolvedParams.doctorId;

  console.log(
    `[appointment-page] Loading appointment for doctorId: ${doctorId}`,
  );

  try {
    const [doctorData, slotsData] = await Promise.all([
      getDoctorDetails(doctorId, accessToken),
      getDoctorSlots(doctorId, accessToken),
    ]);

    console.log(`[appointment-page] Successfully loaded doctor data and slots`);

    return (
      <AppointmentFormPage
        doctorId={parseInt(doctorId)}
        doctorData={doctorData}
        slotsData={slotsData.slots || []}
      />
    );
  } catch (error) {
    console.error(
      "[appointment-page] Error loading appointment page:",
      error instanceof Error ? error.message : error,
    );
    // Don't redirect - instead show error page or return error component
    // This prevents the redirect loop issue
    throw error;
  }
}
