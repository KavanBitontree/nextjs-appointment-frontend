"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";

interface ApprovalResponse {
  appointment_id: number;
  status: string;
  message: string;
  patient_name: string;
  payment_deadline: string;
  payment_deadline_formatted: string;
  payment_timeout_minutes: number;
}

export default function ApproveAppointmentClient() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("");
  const [approvalData, setApprovalData] = useState<ApprovalResponse | null>(
    null,
  );

  useEffect(() => {
    if (!appointmentId) return;

    const approve = async () => {
      try {
        // Include token in query params if present (from email link)
        const url = token
          ? `/appointments/${appointmentId}/approve?token=${token}`
          : `/appointments/${appointmentId}/approve`;

        const { data } = await api.post<ApprovalResponse>(url);
        setApprovalData(data);
        setMessage(data.message || "Appointment approved successfully");
        setStatus("success");
      } catch (err: any) {
        setMessage(
          err?.response?.data?.detail || "Unable to approve appointment",
        );
        setStatus("error");
      }
    };

    approve();
  }, [appointmentId, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {status === "loading" && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Approving appointment...
            </h1>
            <p className="text-gray-500 mt-2">Please wait</p>
          </div>
        )}

        {status === "success" && approvalData && (
          <>
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white rounded-full p-3">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center">
                Appointment Approved!
              </h1>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700">{message}</p>
              </div>

              {/* Patient Info */}
              <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Patient Information
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Patient Name:</span>
                  <span className="font-medium text-gray-900">
                    {approvalData.patient_name}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium text-gray-900">
                    #{approvalData.appointment_id}
                  </span>
                </div>
              </div>

              {/* Payment Deadline Alert */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Payment Pending
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        The patient has been notified via email and must
                        complete payment within:
                      </p>
                      <p className="font-bold text-lg mt-2">
                        {approvalData.payment_timeout_minutes} minutes
                      </p>
                      <p className="mt-2">
                        <strong>Payment Deadline:</strong>{" "}
                        {approvalData.payment_deadline_formatted}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/doctor/dashboard")}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push("/doctor/appointments")}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                >
                  View All Appointments
                </button>
              </div>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white rounded-full p-3">
                  <svg
                    className="w-12 h-12 text-red-600"
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
              </div>
              <h1 className="text-3xl font-bold text-white text-center">
                Approval Failed
              </h1>
            </div>

            <div className="p-8">
              <p className="text-center text-gray-700 mb-6 text-lg">
                {message}
              </p>
              <button
                onClick={() => router.push("/doctor/dashboard")}
                className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


