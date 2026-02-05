"use client";

import Link from "next/link";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/axios";
import { getDeviceInfo } from "@/lib/device";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { loginSchema, type LoginFormData } from "@/schemas/login";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface SessionConflict {
  device_model: string;
  last_login_at: string;
  email: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUser } = useAuth(); // Get refreshUser from auth context
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionConflict, setSessionConflict] =
    useState<SessionConflict | null>(null);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginFormData, boolean>>
  >({});

  const validateField = (name: keyof LoginFormData, value: string) => {
    if (name === "email") {
      if (!value) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Enter a valid email address";
      return undefined;
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 8)
        return "Password must be at least 8 characters long";
      if (value.length > 64) return "Password too long";
      return undefined;
    }
    return undefined;
  };

  const runValidation = (data: LoginFormData) => {
    const result = loginSchema.safeParse(data);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const formatted = result.error.flatten().fieldErrors;
    setFieldErrors({
      email: formatted.email?.[0],
      password: formatted.password?.[0],
    });
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value,
    } as LoginFormData;
    setFormData(updated);

    // Only validate on change if field was already touched (blur happened)
    if (touched[name as keyof LoginFormData]) {
      const error = validateField(name as keyof LoginFormData, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
    setError("");
  };

  const handleFocus = (name: keyof LoginFormData) => {
    // Clear error on focus
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (name: keyof LoginFormData) => {
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Validate on blur
    const error = validateField(name, formData[name]);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleLogin = async (forceLogin: boolean = false) => {
    localStorage.removeItem("access_token");
    setError("");

    const isValid = runValidation(formData);
    if (!isValid) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const deviceInfo = getDeviceInfo();

      const response = await api.post(`${API_BASE_URL}/auth/login`, formData, {
        params: {
          device_fingerprint: deviceInfo.device_fingerprint,
          device_model: deviceInfo.device_model,
          force_login: forceLogin,
        },
        withCredentials: true,
      });

      const { access_token, user_id, role } = response.data;
      const normalizedRole =
        typeof role === "string"
          ? (role.toLowerCase() as "patient" | "doctor")
          : "patient";

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user_id.toString());
      localStorage.setItem("user_role", normalizedRole);

      showToast("Login successful!", "success");

      // Refresh the auth context to update the user state immediately
      await refreshUser();

      // Navigate to the appropriate dashboard
      if (normalizedRole === "patient") {
        router.replace("/patient/dashboard");
      } else if (normalizedRole === "doctor") {
        router.replace("/doctor/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        const detail = err.response.data.detail;
        const conflict = {
          device_model: detail.device_model,
          last_login_at: detail.last_login_at,
          email: formData.email,
        };
        setSessionConflict(conflict);
        showToast("You are already logged in on another device", "warning");
      } else {
        const message =
          err.response?.data?.detail || "Login failed. Please try again.";
        const errorMsg =
          typeof message === "string" ? message : "Invalid credentials";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleLogin(false);
  };

  const handleForceLogin = async () => {
    await handleLogin(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-stretch md:items-center justify-center px-4 py-8 sm:py-10 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!sessionConflict ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-slate-200">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-center text-slate-600 mb-8">
                Sign in to continue to your account
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-500 ${
                      fieldErrors.email ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="your@email.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={() => handleBlur("password")}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all pr-12 text-slate-900 placeholder-slate-500 ${
                        fieldErrors.password
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-6">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-slate-900 font-semibold hover:text-slate-700 transition-colors underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="conflict"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-slate-200">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-yellow-700" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center text-slate-900 mb-3">
                Already Logged In
              </h1>
              <p className="text-center text-slate-600 mb-6">
                You're currently logged in from another device
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">Device</span>
                  <span className="text-slate-900 font-semibold">
                    {sessionConflict.device_model}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Last Login</span>
                  <span className="text-slate-900 font-semibold text-sm">
                    {formatDate(sessionConflict.last_login_at)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center mb-6">
                Logging in here will log you out from the other device. Do you
                want to continue?
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleForceLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Yes, Log me in here"}
                </button>

                <button
                  onClick={() => setSessionConflict(null)}
                  className="w-full bg-white text-slate-900 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 border border-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
