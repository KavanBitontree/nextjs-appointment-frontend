"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Save, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useMapEvents, useMap } from "react-leaflet";
import type { DoctorProfile, DoctorProfileUpdateData } from "@/types/profile";
import { doctorProfileUpdateSchema } from "@/schemas/profileSchemas";

// Dynamically import map components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface DoctorProfileEditProps {
  profile: DoctorProfile;
  onSave: (data: DoctorProfileUpdateData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

// Static list of common medical specialities
const MEDICAL_SPECIALITIES = [
  "General Physician",
  "Paediatrician",
  "Orthopaedic",
  "Cardiologist",
  "Dermatologist",
  "Gynaecologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Dentist",
  "Psychiatrist",
  "Neurologist",
  "Gastroenterologist",
  "Urologist",
  "Pulmonologist",
  "Endocrinologist",
];

// Location Picker Component for Map
function LocationPicker({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    formData.latitude || 20,
    formData.longitude || 77,
  ]);

  // Only import L on client side
  const [L, setL] = useState<any>(null);
  const map = useMap();

  useEffect(() => {
    import("leaflet").then((leaflet) => setL(leaflet.default));
  }, []);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);

      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await resp.json();
        const address = data.display_name || "";

        setFormData((prev: any) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address,
        }));
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        setFormData((prev: any) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      }
    },
  });

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition([formData.latitude, formData.longitude]);
      map.setView([formData.latitude, formData.longitude], 13);
    }
  }, [formData.latitude, formData.longitude, map]);

  if (!L) return null;

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

export default function DoctorProfileEdit({
  profile,
  onSave,
  onCancel,
  saving = false,
}: DoctorProfileEditProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    speciality: profile.speciality,
    opd_fees: profile.opd_fees,
    minimum_slot_duration: profile.minimum_slot_duration,
    address: profile.address || "",
    latitude: profile.latitude,
    longitude: profile.longitude,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Add key to force remount

  useEffect(() => {
    // Import leaflet CSS on client side
    import("leaflet/dist/leaflet.css");
    setMapReady(true);
    
    // Cleanup on unmount
    return () => {
      setMapReady(false);
      // Force new map instance on next mount
      setMapKey(prev => prev + 1);
    };
  }, []);

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
          headers: { "User-Agent": "DoctorClinicApp/1.0" },
        },
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("Address search failed:", err);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddressSearch = (query: string) => {
    setFormData((prev) => ({ ...prev, address: query }));

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

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

    if (name === "address") {
      handleAddressSearch(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "opd_fees" || name === "minimum_slot_duration"
          ? parseFloat(value) || 0
          : value,
    }));

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Prepare data (only include changed fields)
    const updates: DoctorProfileUpdateData = {};
    if (formData.name !== profile.name) updates.name = formData.name;
    if (formData.speciality !== profile.speciality)
      updates.speciality = formData.speciality;
    if (formData.opd_fees !== profile.opd_fees)
      updates.opd_fees = formData.opd_fees;
    if (formData.minimum_slot_duration !== profile.minimum_slot_duration)
      updates.minimum_slot_duration = formData.minimum_slot_duration;

    // Handle location updates (all or nothing)
    if (
      formData.address !== profile.address ||
      formData.latitude !== profile.latitude ||
      formData.longitude !== profile.longitude
    ) {
      updates.address = formData.address;
      updates.latitude = formData.latitude;
      updates.longitude = formData.longitude;
    }

    // Validate
    try {
      doctorProfileUpdateSchema.parse(updates);
      await onSave(updates);
    } catch (error: any) {
      if (error.errors) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-6 text-white flex items-center justify-between">
        <h2 className="text-xl font-bold">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name & Speciality */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Speciality
            </label>
            <select
              name="speciality"
              value={formData.speciality}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            >
              <option value="">Select Speciality</option>
              {MEDICAL_SPECIALITIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.speciality && (
              <p className="mt-1 text-xs text-red-600">{errors.speciality}</p>
            )}
          </div>
        </div>

        {/* OPD Fees & Slot Duration */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              OPD Fees (₹)
            </label>
            <input
              type="number"
              name="opd_fees"
              value={formData.opd_fees}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
            {errors.opd_fees && (
              <p className="mt-1 text-xs text-red-600">{errors.opd_fees}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slot Duration
            </label>
            <select
              name="minimum_slot_duration"
              value={formData.minimum_slot_duration}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            >
              <option value="0.25">15 minutes</option>
              <option value="0.5">30 minutes</option>
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
            </select>
          </div>
        </div>

        {/* Address Search */}
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
                if (formData.address.length >= 2) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Search for clinic address..."
              autoComplete="off"
              required
            />
            {searching && (
              <div className="absolute right-4 top-3.5 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] max-h-72 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-3"
                >
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-900">
                    {suggestion.display_name}
                  </p>
                </button>
              ))}
            </div>
          )}
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Map */}
        {mapReady && (
          <div className="h-64 border rounded-lg overflow-hidden relative z-0">
            <MapContainer
              key={mapKey}
              center={[formData.latitude || 20, formData.longitude || 77]}
              zoom={5}
              style={{ width: "100%", height: "100%" }}
              className="relative z-0"
              scrollWheelZoom={true}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker formData={formData} setFormData={setFormData} />
            </MapContainer>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
