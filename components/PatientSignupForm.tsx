"use client";

import Link from "next/link";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { z } from "zod";
import axios from "axios";
import { getDeviceInfo } from "@/lib/device";
import {
  getPasswordStrength,
  validateEmail,
  validateName,
  validateDOB,
  validateSignupPassword,
  validateConfirmPassword,
  calculateAge,
  getMaxDOB,
  getMinDOB,
} from "@/lib/validation";
import {
  patientSignupSchema,
  type PatientSignupFormData,
} from "@/schemas/patientSignup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type PatientFormData = PatientSignupFormData;

export default function PatientSignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState<PatientFormData>({
    email: "",
    password: "",
    confirm_password: "",
    name: "",
    dob: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PatientFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof PatientFormData, boolean>>
  >({});

  const passwordStrength = getPasswordStrength(formData.password);
  const calculatedAge = formData.dob ? calculateAge(formData.dob) : null;

  const validateField = (name: keyof PatientFormData, value: string) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "name":
        return validateName(value);
      case "dob":
        return validateDOB(value);
      case "password":
        return validateSignupPassword(value);
      case "confirm_password":
        return validateConfirmPassword(formData.password, value);
      default:
        return undefined;
    }
  };

  const runValidation = (data: PatientFormData) => {
    const result = patientSignupSchema.safeParse(data);
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const nextErrors: Partial<Record<keyof PatientFormData, string>> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof PatientFormData;
      if (!nextErrors[key]) {
        nextErrors[key] = issue.message;
      }
    });
    setFieldErrors(nextErrors);
    return false;
  };

  const formIsValid = patientSignupSchema.safeParse(formData).success;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value,
    } as PatientFormData;
    setFormData(updated);

    if (touched[name as keyof PatientFormData]) {
      const error = validateField(name as keyof PatientFormData, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
    setError("");
  };

  const handleFocus = (name: keyof PatientFormData) => {
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (name: keyof PatientFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = formData[name];
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!runValidation(formData)) {
      setError("Please fix the highlighted fields");
      return;
    }

    setLoading(true);

    try {
      const deviceInfo = getDeviceInfo();

      const response = await axios.post(
        `${API_BASE_URL}/signup/patient`,
        formData,
        {
          params: {
            device_fingerprint: deviceInfo.device_fingerprint,
            device_model: deviceInfo.device_model,
          },
          withCredentials: true,
        },
      );

      const { access_token, user_id, role } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", user_id.toString());
      localStorage.setItem("user_role", role);

      await refreshUser();
      showToast("Account created successfully!", "success");

      router.push("/patient/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosError.response?.data?.detail || "Signup failed. Please try again.";
      const errorMsg =
        typeof message === "string" ? message : JSON.stringify(message);
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (
    fieldName: keyof PatientFormData,
    hasIcon = false,
  ) => {
    const baseClass = `w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-500 ${hasIcon ? "pr-12" : ""}`;
    const errorClass = fieldErrors[fieldName]
      ? "border-red-500"
      : "border-slate-300";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-200"
      >
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Role Selection
        </Link>
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Create Patient Account
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Join our healthcare platform
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
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              required
              className={getInputClassName("name")}
              placeholder="John Doe"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onFocus={() => handleFocus("dob")}
                onBlur={() => handleBlur("dob")}
                required
                min={getMinDOB()}
                max={getMaxDOB()}
                className={getInputClassName("dob", false)}
              />
            </div>
            {fieldErrors.dob && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.dob}</p>
            )}
            {calculatedAge !== null && !fieldErrors.dob && formData.dob && (
              <p className="mt-1 text-xs text-slate-600">
                Age: {calculatedAge} years old
              </p>
            )}
          </div>

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
              required
              className={getInputClassName("email")}
              placeholder="john@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
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
                required
                className={getInputClassName("password", true)}
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

            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`h-2 flex-1 rounded-full ${
                      passwordStrength.strength === "weak"
                        ? "bg-red-200"
                        : passwordStrength.strength === "medium"
                          ? "bg-yellow-200"
                          : "bg-green-200"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.strength === "weak"
                          ? "bg-red-600 w-1/3"
                          : passwordStrength.strength === "medium"
                            ? "bg-yellow-600 w-2/3"
                            : "bg-green-600 w-full"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.strength === "weak"
                        ? "text-red-700"
                        : passwordStrength.strength === "medium"
                          ? "text-yellow-700"
                          : "text-green-700"
                    }`}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>

                <div className="space-y-1">
                  {[
                    {
                      test: formData.password.length >= 8,
                      label: "At least 8 characters",
                    },
                    {
                      test: /[A-Z]/.test(formData.password),
                      label: "One uppercase letter",
                    },
                    {
                      test: /[0-9]/.test(formData.password),
                      label: "One number",
                    },
                    {
                      test: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
                      label: "One special character",
                    },
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {req.test ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                      <span
                        className={
                          req.test ? "text-green-700" : "text-slate-500"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onFocus={() => handleFocus("confirm_password")}
                onBlur={() => handleBlur("confirm_password")}
                required
                className={getInputClassName("confirm_password", true)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.confirm_password}
              </p>
            )}
            {formData.confirm_password && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {formData.password === formData.confirm_password ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          {"Already have an account? "}
          <Link
            href="/login"
            className="text-slate-900 font-semibold hover:text-slate-700 transition-colors underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
