"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, HeartPulse } from "lucide-react";

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl w-full z-10"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-slate-900 mb-4"
          >
            Join HealthCare
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-slate-700 mb-12"
          >
            Choose your role to get started
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/signup/patient")}
            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <HeartPulse className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Patient
              </h2>
              <p className="text-slate-600 mb-6">
                Book appointments, manage your health records, and connect with
                healthcare professionals
              </p>

              <div className="flex items-center justify-center text-slate-900 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span>Continue as Patient</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/signup/doctor")}
            className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200"
          >
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-3">Doctor</h2>
              <p className="text-slate-600 mb-6">
                Manage appointments, access patient records, and provide quality
                healthcare services
              </p>

              <div className="flex items-center justify-center text-slate-900 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span>Continue as Doctor</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-slate-700">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-slate-900 font-semibold hover:text-slate-700 transition-colors underline"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
