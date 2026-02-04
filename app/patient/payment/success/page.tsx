"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";

// Get API base URL (same as in axios.ts)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PaymentVerification {
  paid: boolean;
  status: string;
  appointment_status: string;
  payment_status?: string;
  error?: string;
}

interface AppointmentDetails {
  appointment_id: number;
  doctor_name: string;
  specialization: string;
  opd_fees: number;
  slot_date: string;
  slot_time: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");
  const sessionId = searchParams.get("session_id");
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentVerification | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId || !sessionId) {
      setError("Missing appointment ID or session ID");
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // Verify payment status with backend
        // Include token in query params if present (from email link)
        const tokenParam = token ? `&token=${token}` : "";
        const verifyUrl = `/payment/verify?appointment_id=${appointmentId}&session_id=${sessionId}${tokenParam}`;
        
        // Use api.get which will handle authentication automatically
        // Token in query params will be used by backend if present
        const { data: verifyData } = await api.get<PaymentVerification>(verifyUrl);
        setPaymentStatus(verifyData);

        // If payment is successful, fetch appointment details
        if (verifyData.paid) {
          try {
            const detailsUrl = token
              ? `/appointments/${appointmentId}/payment-details?token=${token}`
              : `/appointments/${appointmentId}/payment-details`;
            
            const { data } = await api.get<AppointmentDetails>(detailsUrl);
            setAppointmentDetails(data);
          } catch (err) {
            // If we can't fetch details, that's okay - we still show success
            console.error("Failed to fetch appointment details:", err);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [appointmentId, sessionId, token]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Verifying Payment...
          </h1>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/patient/appointments")}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
          >
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  if (!paymentStatus) {
    return null;
  }

  if (!paymentStatus.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Not Confirmed
          </h1>
          <p className="text-gray-600 mb-6">
            {paymentStatus.error || "Payment verification failed. Please contact support if you were charged."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/patient/appointments")}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
            >
              View My Appointments
            </button>
            <button
              onClick={() => router.push(`/patient/payment?appointment_id=${appointmentId}${token ? `&token=${token}` : ""}`)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
              Payment Successful!
            </h1>
            <p className="text-green-100 text-center mt-2">
              Your appointment has been confirmed
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Success Message */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
              <p className="text-green-800">
                <strong>✅ Payment Confirmed</strong>
              </p>
              <p className="text-green-700 text-sm mt-1">
                Your payment has been processed successfully. Your appointment is now confirmed.
              </p>
            </div>

            {/* Appointment Details */}
            {appointmentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Appointment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium text-gray-900">
                      Dr. {appointmentDetails.doctor_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-medium text-gray-900">
                      {appointmentDetails.specialization}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {appointmentDetails.slot_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {appointmentDetails.slot_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment ID:</span>
                    <span className="font-medium text-gray-900">
                      #{appointmentDetails.appointment_id}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₹{appointmentDetails.opd_fees}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Payment Status
              </h3>
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> {paymentStatus.payment_status || paymentStatus.status}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Appointment Status:</strong> {paymentStatus.appointment_status}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ You'll receive a confirmation email with all details</li>
                <li>✓ You can view your appointment in "My Appointments"</li>
                <li>✓ Join the consultation at the scheduled time</li>
                <li>✓ You'll receive a reminder before your appointment</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/patient/appointments")}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                View My Appointments
              </button>
              <button
                onClick={() => router.push("/patient/dashboard")}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

