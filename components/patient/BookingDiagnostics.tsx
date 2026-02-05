"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle, Loader } from "lucide-react";

/**
 * Diagnostic component to help debug "Book Now" redirect issues
 *
 * Usage:
 * Import and add this component to a page to test API connectivity and auth:
 *
 * import BookingDiagnostics from "@/components/patient/BookingDiagnostics";
 *
 * export default function DiagnosticPage() {
 *   return <BookingDiagnostics />;
 * }
 */

interface DiagnosticResult {
  name: string;
  status: "pending" | "success" | "error" | "warning";
  message: string;
  details?: string;
}

export default function BookingDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (
    name: string,
    status: DiagnosticResult["status"],
    message: string,
    details?: string,
  ) => {
    setResults((prev) => [...prev, { name, status, message, details }]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setIsRunning(true);

    try {
      // 1. Check API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        addResult(
          "API URL Configuration",
          "error",
          "NEXT_PUBLIC_API_URL is not set",
          "Set it in Vercel Environment Variables or .env.local",
        );
      } else {
        addResult(
          "API URL Configuration",
          "success",
          `API URL is set: ${apiUrl}`,
        );
      }

      // 2. Check token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      if (!token) {
        addResult(
          "Authentication Token",
          "error",
          "No access_token cookie found",
          "User might not be logged in. Try logging in first.",
        );
      } else {
        addResult(
          "Authentication Token",
          "success",
          `Token found (length: ${token.length})`,
        );
      }

      // 3. Test API connectivity (if we have URL and token)
      if (apiUrl && token) {
        try {
          const response = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            addResult(
              "API Connectivity",
              "success",
              "Connected to API successfully",
              `User role: ${data.role}`,
            );
          } else {
            addResult(
              "API Connectivity",
              "error",
              `API returned ${response.status}: ${response.statusText}`,
              "Check if API is running and token is valid",
            );
          }
        } catch (error) {
          addResult(
            "API Connectivity",
            "error",
            "Failed to connect to API",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }

      // 4. Test doctor endpoint (use doctorId=1 for test)
      if (apiUrl && token) {
        try {
          const response = await fetch(`${apiUrl}/doctors/1`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (response.ok) {
            addResult(
              "Doctor Endpoint",
              "success",
              "Doctor endpoint is accessible",
            );
          } else if (response.status === 404) {
            addResult(
              "Doctor Endpoint",
              "warning",
              "Doctor endpoint returned 404",
              "Endpoint exists but doctor ID 1 might not exist. This is OK - just testing connectivity.",
            );
          } else {
            addResult(
              "Doctor Endpoint",
              "error",
              `Doctor endpoint returned ${response.status}`,
              "Check if endpoint path is correct",
            );
          }
        } catch (error) {
          addResult(
            "Doctor Endpoint",
            "error",
            "Failed to reach doctor endpoint",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }

      // 5. Test slots endpoint
      if (apiUrl && token) {
        try {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const params = new URLSearchParams({
            doctor_id: "1",
            start_date: today.toISOString().split("T")[0],
            end_date: tomorrow.toISOString().split("T")[0],
            status: "FREE",
          });

          const response = await fetch(
            `${apiUrl}/patient/view/slots?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            },
          );

          if (response.ok) {
            addResult(
              "Slots Endpoint",
              "success",
              "Slots endpoint is accessible",
            );
          } else if (response.status === 404) {
            addResult(
              "Slots Endpoint",
              "warning",
              "Slots endpoint returned 404",
              "Endpoint path might be different. Check your API documentation.",
            );
          } else {
            addResult(
              "Slots Endpoint",
              "error",
              `Slots endpoint returned ${response.status}`,
              "Check endpoint path and parameters",
            );
          }
        } catch (error) {
          addResult(
            "Slots Endpoint",
            "error",
            "Failed to reach slots endpoint",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }

      // 6. Check browser environment
      const isProduction = process.env.NODE_ENV === "production";
      addResult(
        "Environment",
        "success",
        `Running in ${isProduction ? "production" : "development"} mode`,
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Loader className="w-5 h-5 text-slate-600 animate-spin" />;
    }
  };

  const getStyles = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-900";
      default:
        return "bg-slate-50 border-slate-200 text-slate-900";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Booking System Diagnostics
          </h1>
          <p className="text-slate-600 mb-6">
            This tool helps diagnose issues with the "Book Now" button
            redirecting to dashboard.
          </p>

          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mb-6 flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              "Run Diagnostics"
            )}
          </button>

          {results.length === 0 && !isRunning && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                Click the button above to run diagnostics
              </p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStyles(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(result.status)}
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{result.name}</p>
                    <p className="text-sm">{result.message}</p>
                    {result.details && (
                      <p className="text-xs opacity-75 mt-1 font-mono">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-3">Next Steps:</h2>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>Fix any "error" issues shown above</li>
                <li>Check the ENV_SETUP_GUIDE.md for configuration</li>
                <li>Verify your API server is running and accessible</li>
                <li>Test the "Book Now" button again</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
