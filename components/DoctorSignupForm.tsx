"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { getDeviceInfo } from "@/lib/device";

import {
  getPasswordStrength,
  validateEmail,
  validateName,
  validateSignupPassword,
  validateConfirmPassword,
  validateSpeciality,
  validateOpdFees,
  validateAddress,
  validateLatitude,
  validateLongitude,
} from "@/lib/validation";

import {
  doctorSignupSchema,
  type DoctorSignupFormData,
} from "@/schemas/doctorSignup";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  MapPin,
  X,
} from "lucide-react";

// Leaflet imports
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationSuggestion {
  display_name: string;
  lat: number;
  lon: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type DoctorFormData = DoctorSignupFormData;

// Map click component
function LocationPicker({
  formData,
  setFormData,
}: {
  formData: DoctorFormData;
  setFormData: React.Dispatch<React.SetStateAction<DoctorFormData>>;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    formData.latitude || 20,
    formData.longitude || 77,
  ]);
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);

      // Reverse geocoding using Nominatim
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await resp.json();
        const address = data.display_name || "";

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address,
        }));
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      }
    },
  });

  // Update marker when formData changes (from search selection)
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition([formData.latitude, formData.longitude]);
      map.setView([formData.latitude, formData.longitude], 13);
    }
  }, [formData.latitude, formData.longitude, map]);

  return (
    <Marker
      position={markerPosition}
      icon={L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOSAtNiAtOSAtMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })}
    />
  );
}

export default function DoctorSignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState<DoctorFormData>({
    email: "",
    password: "",
    confirm_password: "",
    name: "",
    speciality: "",
    opd_fees: 0,
    minimum_slot_duration: 0.5,
    address: "",
    latitude: 0,
    longitude: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DoctorFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof DoctorFormData, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const passwordStrength = getPasswordStrength(formData.password);

  const numericFields = ["opd_fees", "minimum_slot_duration"] as const;

  const validateField = (
    name: keyof DoctorFormData,
    value: string | number,
  ) => {
    switch (name) {
      case "email":
        return validateEmail(value as string);
      case "name":
        return validateName(value as string);
      case "speciality":
        return validateSpeciality(value as string);
      case "opd_fees":
        return validateOpdFees(value as number);
      case "password":
        return validateSignupPassword(value as string);
      case "confirm_password":
        return validateConfirmPassword(formData.password, value as string);
      case "address":
        return validateAddress(value as string);
      case "latitude":
        return validateLatitude(value as number);
      case "longitude":
        return validateLongitude(value as number);
      default:
        return undefined;
    }
  };

  const runValidation = (data: DoctorFormData) => {
    const result = doctorSignupSchema.safeParse(data);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const nextErrors: Partial<Record<keyof DoctorFormData, string>> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof DoctorFormData;
      if (!nextErrors[key]) nextErrors[key] = issue.message;
    });
    setFieldErrors(nextErrors);
    return false;
  };

  // Search for address suggestions with debounce
  const searchAddress = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            "User-Agent": "DoctorClinicApp/1.0",
          },
        },
      );
      const data = await response.json();
      console.log("[v0] Search results:", data);
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("[v0] Address search failed:", err);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddressSearch = (query: string) => {
    setFormData((prev) => ({
      ...prev,
      address: query,
    }));

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer (500ms delay)
    debounceTimer.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    console.log("[v0] Selected suggestion:", {
      lat,
      lon,
      display_name: suggestion.display_name,
    });

    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      latitude: lat,
      longitude: lon,
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Special handling for address field
    if (name === "address") {
      handleAddressSearch(value);
      return;
    }

    const updated = {
      ...formData,
      [name]: numericFields.includes(name as any)
        ? parseFloat(value) || 0
        : value,
    } as DoctorFormData;

    setFormData(updated);

    if (touched[name as keyof DoctorFormData]) {
      const fieldValue = numericFields.includes(name as any)
        ? parseFloat(value) || 0
        : value;
      const error = validateField(name as keyof DoctorFormData, fieldValue);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
    setError("");
  };

  const handleFocus = (name: keyof DoctorFormData) => {
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (name: keyof DoctorFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = numericFields.includes(name as any)
      ? (formData[name] as number)
      : (formData[name] as string);
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
        `${API_BASE_URL}/signup/doctor`,
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
      router.push("/doctor/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosError.response?.data?.detail || "Signup failed. Please try again.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (
    fieldName: keyof DoctorFormData,
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
          Create Doctor Account
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Join our medical professional network
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
          {/* Name & Speciality */}
          <div className="grid md:grid-cols-2 gap-5">
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
                placeholder="Dr. Jane Smith"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Speciality
              </label>
              <input
                type="text"
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                onFocus={() => handleFocus("speciality")}
                onBlur={() => handleBlur("speciality")}
                required
                className={getInputClassName("speciality")}
                placeholder="Cardiology"
              />
              {fieldErrors.speciality && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.speciality}
                </p>
              )}
            </div>
          </div>

          {/* OPD & Slot */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                OPD Fees (₹)
              </label>
              <input
                type="number"
                name="opd_fees"
                value={formData.opd_fees || ""}
                onChange={handleChange}
                onFocus={() => handleFocus("opd_fees")}
                onBlur={() => handleBlur("opd_fees")}
                required
                min="0"
                step="0.01"
                className={getInputClassName("opd_fees")}
                placeholder="500.00"
              />
              {fieldErrors.opd_fees && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.opd_fees}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slot Duration (hours)
              </label>
              <select
                name="minimum_slot_duration"
                value={formData.minimum_slot_duration}
                onChange={handleChange}
                required
                className={getInputClassName("minimum_slot_duration")}
              >
                <option value="0.25">15 minutes</option>
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
              </select>
              {fieldErrors.minimum_slot_duration && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.minimum_slot_duration}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
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
              placeholder="doctor@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Address */}
          <div className="relative z-10">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Clinic Address
            </label>
            <div className="relative z-20">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => {
                  handleFocus("address");
                  if (formData.address.length >= 2) setShowSuggestions(true);
                }}
                onBlur={() => {
                  handleBlur("address");
                  // Delay hiding to allow click on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                required
                className={getInputClassName("address")}
                placeholder="Search for clinic address..."
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-4 top-3.5 text-slate-400">
                  <div className="animate-spin">⏳</div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] max-h-72 overflow-y-auto"
              >
                {suggestions.map((suggestion: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(suggestion);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-3"
                  >
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        {suggestion.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {fieldErrors.address && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          {/* Map */}
          <div className="h-64 mt-3 mb-4 border rounded-lg overflow-hidden relative z-0">
            <MapContainer
              center={[formData.latitude || 20, formData.longitude || 77]}
              zoom={5}
              style={{ width: "100%", height: "100%" }}
              className="relative z-0"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker formData={formData} setFormData={setFormData} />
            </MapContainer>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Doctor Account..." : "Create Doctor Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
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
