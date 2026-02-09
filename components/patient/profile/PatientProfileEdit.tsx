"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import type { PatientProfile, PatientProfileUpdateData } from "@/types/profile";
import { patientProfileUpdateSchema } from "@/schemas/profileSchemas";

interface PatientProfileEditProps {
  profile: PatientProfile;
  onSave: (data: PatientProfileUpdateData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function PatientProfileEdit({
  profile,
  onSave,
  onCancel,
  saving = false,
}: PatientProfileEditProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    dob: profile.dob,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Prepare data (only include changed fields)
    const updates: PatientProfileUpdateData = {};
    if (formData.name !== profile.name) updates.name = formData.name;
    if (formData.dob !== profile.dob) updates.dob = formData.dob;

    // Validate
    try {
      patientProfileUpdateSchema.parse(updates);
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

  // Calculate max date (today) and min date (150 years ago)
  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 150),
  )
    .toISOString()
    .split("T")[0];

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
        {/* Name */}
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
            placeholder="Your full name"
            required
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            min={minDate}
            max={today}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
            required
          />
          {errors.dob && (
            <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Your current age will be automatically calculated
          </p>
        </div>

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
