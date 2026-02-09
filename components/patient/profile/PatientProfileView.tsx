"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Calendar, Mail, Edit2, Cake } from "lucide-react";
import type { PatientProfile } from "@/types/profile";

interface PatientProfileViewProps {
  profile: PatientProfile;
  onEdit: () => void;
}

export default function PatientProfileView({
  profile,
  onEdit,
}: PatientProfileViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-slate-300 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {profile.age} years old
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-4">
        {/* Email */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">Email</p>
            <p className="text-slate-900 mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Cake className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">Date of Birth</p>
            <p className="text-slate-900 mt-0.5 font-semibold">
              {formatDate(profile.dob)}
            </p>
          </div>
        </div>

        {/* Age */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">Age</p>
            <p className="text-slate-900 mt-0.5 text-2xl font-bold">
              {profile.age}
              <span className="text-sm font-normal text-slate-600 ml-2">
                years
              </span>
            </p>
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
