import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppointmentForm from "@/components/patient/AppointmentForm";

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
  status: "FREE" | "BOOKED" | "BLOCKED";
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
  params: Promise<{ "doctor-id": string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const doctorId = resolvedParams["doctor-id"];

  try {
    const [doctorData, slotsData] = await Promise.all([
      getDoctorDetails(doctorId, accessToken),
      getDoctorSlots(doctorId, accessToken),
    ]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Book Appointment
                </h1>
                <p className="text-slate-600">
                  Schedule your consultation with Dr. {doctorData.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Consultation Fee</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{doctorData.opd_fees}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Speciality</p>
                <p className="font-medium text-slate-900">
                  {doctorData.speciality}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Experience</p>
                <p className="font-medium text-slate-900">
                  {doctorData.experience || "N/A"} years
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-medium text-slate-900">
                  {doctorData.address}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <AppointmentForm
            doctorId={parseInt(doctorId)}
            doctorName={doctorData.name}
            slots={slotsData.slots || []}
            opdFees={Number(doctorData.opd_fees)}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading appointment page:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Error Loading Page
          </h2>
          <p className="text-slate-600 mb-6">
            We couldn't load the appointment details. Please try again later.
          </p>
          <a
            href="/patient/show-doctors"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Back to Doctors
          </a>
        </div>
      </div>
    );
  }
}
