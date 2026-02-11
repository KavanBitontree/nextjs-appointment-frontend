"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AppointmentItem {
  id: number;
  status: string;
  slot_date: string;
  [key: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching patient appointments...");
        console.log("🌐 API URL:", API_BASE_URL);

        // Get access token from cookie
        const getAccessToken = () => {
          const cookies = document.cookie.split(";");
          const accessTokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("access_token="),
          );
          return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
        };

        const accessToken = getAccessToken();
        console.log("🔑 Access token found:", !!accessToken);

        if (!accessToken) {
          console.error("❌ No access token found in cookies");
          throw new Error("Not authenticated");
        }

        // Call backend API directly with Authorization header
        const response = await fetch(
          `${API_BASE_URL}/appointments/my-appointments?page=1&page_size=100`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Send token in header
            },
            credentials: "include", // Also send cookies
          },
        );

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API Error:", response.status, errorData);
          throw new Error(errorData.detail || "Failed to fetch appointments");
        }

        const data = await response.json();
        console.log("✅ Appointments fetched:", {
          total: data.total,
          count: data.appointments?.length || 0,
        });

        const appointments: AppointmentItem[] = data.appointments || [];

        // Calculate current month's upcoming appointments
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const upcomingThisMonth = appointments.filter((apt) => {
          // Only count APPROVED and PAID appointments
          if (apt.status !== "APPROVED" && apt.status !== "PAID") {
            return false;
          }

          const slotDate = new Date(apt.slot_date);
          return (
            slotDate.getMonth() === currentMonth &&
            slotDate.getFullYear() === currentYear &&
            slotDate >= now // Only future appointments
          );
        }).length;

        const calculatedStats = {
          upcomingAppointments: upcomingThisMonth,
          totalAppointments: appointments.length,
        };

        console.log("📊 Calculated stats:", calculatedStats);

        setStats(calculatedStats);
      } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        setStats({
          upcomingAppointments: 0,
          totalAppointments: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-700">
            Welcome back! Here's an overview of your appointments and records
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Upcoming This Month</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.upcomingAppointments}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Appointments</p>
                {loading ? (
                  <div className="h-9 w-12 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalAppointments}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Account Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Email</p>
              <p className="text-lg font-semibold text-slate-900">
                {user?.email}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Status</p>
              <p className="text-lg font-semibold text-green-600">
                {user?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
