"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";

// Get API base URL (same as in axios.ts)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PaymentDetails {
  appointment_id: number;
  doctor_name: string;
  specialization: string;
  opd_fees: number;
  slot_date: string;
  slot_time: string;
  time_remaining: {
    minutes: number;
    seconds: number;
    expires_at: string;
  } | null;
  payment_expires_at: string;
}

// Separate component that uses useSearchParams
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");
  const token = searchParams.get("token");

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch payment details
  useEffect(() => {
    if (!appointmentId) {
      setError("No appointment ID provided");
      setLoading(false);
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        // Include token in query params if present (from email link)
        const url = token
          ? `/appointments/${appointmentId}/payment-details?token=${token}`
          : `/appointments/${appointmentId}/payment-details`;

        const { data } = await api.get<PaymentDetails>(url);
        setPaymentDetails(data);

        // Initialize countdown timer
        if (data.time_remaining) {
          setTimeRemaining({
            minutes: data.time_remaining.minutes,
            seconds: data.time_remaining.seconds,
          });
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.detail || "Failed to load payment details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [appointmentId, token]);

  // Countdown timer
  useEffect(() => {
    if (!timeRemaining) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev) return null;

        let { minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else {
          // Timer expired
          clearInterval(interval);
          setError("Payment window expired. Appointment cancelled.");
          return null;
        }

        return { minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handlePayment = async () => {
    if (!appointmentId) return;

    setProcessing(true);

    // Redirect to backend Stripe payment page with token if present
    const tokenParam = token ? `&token=${token}` : "";
    window.location.href = `${API_BASE_URL}/pay?appointment_id=${appointmentId}${tokenParam}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
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
            Payment Error
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

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Timer Alert */}
        {timeRemaining && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
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
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">Time Remaining:</span>{" "}
                  <span className="text-2xl font-bold">
                    {String(timeRemaining.minutes).padStart(2, "0")}:
                    {String(timeRemaining.seconds).padStart(2, "0")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Complete Your Payment
            </h1>
            <p className="text-green-100 mt-2">
              Secure your appointment with Dr. {paymentDetails.doctor_name}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Appointment Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium text-gray-900">
                    Dr. {paymentDetails.doctor_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.specialization}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.slot_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {paymentDetails.slot_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium text-gray-900">
                    #{paymentDetails.appointment_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Consultation Fee:
                </span>
                <span className="text-4xl font-bold text-green-600">
                  ₹{paymentDetails.opd_fees}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Important:</strong> If payment is not completed
                    within 15 minutes, your appointment will be automatically
                    cancelled and the slot will be released.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing || !timeRemaining}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                processing || !timeRemaining
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                `Pay ₹${paymentDetails.opd_fees} Now`
              )}
            </button>

            {/* Cancel Link */}
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/patient/appointments")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel and go back
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>🔒 Secure payment powered by Stripe (coming soon)</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Your appointment will be confirmed immediately</li>
            <li>✓ You'll receive a confirmation email with all details</li>
            <li>✓ You can view your appointment in "My Appointments"</li>
            <li>✓ Join the consultation at the scheduled time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment page...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
