"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppointmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error("[appointment-form-error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Failed to Load Appointment Form
              </h1>
              <p className="text-slate-600 mb-4">
                We couldn't load the appointment form. This might be due to:
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm mb-6 space-y-1">
                <li>Network connectivity issues</li>
                <li>Your session has expired</li>
                <li>The doctor is no longer available</li>
                <li>A temporary server issue</li>
              </ul>

              {process.env.NODE_ENV === "development" && error.message && (
                <div className="bg-red-50 rounded-lg p-3 mb-6 border border-red-200">
                  <p className="text-xs text-red-700 font-mono mb-1">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-600 font-mono break-words">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => reset()}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/patient/doctors")}
                  className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Doctors
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
