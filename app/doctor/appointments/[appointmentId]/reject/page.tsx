"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";

export default function RejectAppointmentPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!appointmentId) return;

    const reject = async () => {
      try {
        // Include token in query params if present (from email link)
        const url = token
          ? `/appointments/${appointmentId}/reject?token=${token}`
          : `/appointments/${appointmentId}/reject`;
        
        const { data } = await api.post(url);
        setMessage(data.message || "Appointment rejected");
        setStatus("success");
      } catch (err: any) {
        setMessage(
          err?.response?.data?.detail || "Unable to reject appointment",
        );
        setStatus("error");
      }
    };

    reject();
  }, [appointmentId, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold">Rejecting appointment...</h1>
            <p className="text-gray-500 mt-2">Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-orange-600">
              ❌ Request Rejected
            </h1>
            <p className="mt-4 text-gray-700">{message}</p>

            <button
              onClick={() => router.push("/doctor/dashboard")}
              className="mt-6 px-6 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              ⚠️ Action Failed
            </h1>
            <p className="mt-4 text-gray-700">{message}</p>

            <button
              onClick={() => router.push("/doctor/dashboard")}
              className="mt-6 px-6 py-2 bg-slate-700 text-white rounded hover:bg-slate-800"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
