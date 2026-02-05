"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AppointmentErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[appointment-error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-slate-600 mb-4">
                We encountered an error while loading the appointment form. This
                might be a temporary issue.
              </p>

              {error.message && (
                <div className="bg-red-50 rounded-lg p-3 mb-6 border border-red-200">
                  <p className="text-sm text-red-700 font-mono">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={reset}
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
