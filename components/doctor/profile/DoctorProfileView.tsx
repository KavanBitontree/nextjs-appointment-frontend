"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Stethoscope,
  DollarSign,
  Clock,
  MapPin,
  Mail,
  Edit2,
} from "lucide-react";
import type { DoctorProfile } from "@/types/profile";

interface DoctorProfileViewProps {
  profile: DoctorProfile;
  onEdit: () => void;
}

export default function DoctorProfileView({
  profile,
  onEdit,
}: DoctorProfileViewProps) {
  const slotDurationDisplay = (hours: number) => {
    if (hours < 1) {
      return `${hours * 60} minutes`;
    } else if (hours === 1) {
      return "1 hour";
    } else {
      return `${hours} hours`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white relative">
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Edit profile"
        >
          <Edit2 className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-slate-200 flex items-center gap-2 mt-1">
              <Stethoscope className="w-4 h-4" />
              {profile.speciality}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-4">
        {/* Email */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
          <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">Email</p>
            <p className="text-slate-900 mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* OPD Fees */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
          <DollarSign className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">OPD Fees</p>
            <p className="text-slate-900 mt-0.5 font-semibold">
              ₹{profile.opd_fees.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Slot Duration */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
          <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">
              Minimum Slot Duration
            </p>
            <p className="text-slate-900 mt-0.5">
              {slotDurationDisplay(profile.minimum_slot_duration)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
          <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">Clinic Address</p>
            <p className="text-slate-900 mt-0.5 leading-relaxed">
              {profile.address || "Address not set"}
            </p>
            {profile.latitude && profile.longitude && (
              <p className="text-xs text-slate-500 mt-2">
                Coordinates: {profile.latitude.toFixed(6)},{" "}
                {profile.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <div className="px-6 pb-6">
        <button
          onClick={onEdit}
          className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </motion.div>
  );
}
