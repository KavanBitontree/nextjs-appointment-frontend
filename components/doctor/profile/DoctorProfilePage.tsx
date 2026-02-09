"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { getDoctorProfile, updateDoctorProfile } from "@/lib/profile_api";
import type { DoctorProfile, DoctorProfileUpdateData } from "@/types/profile";
import DoctorProfileView from "@/components/doctor/profile/DoctorProfileView";
import DoctorProfileEdit from "@/components/doctor/profile/DoctorProfileEdit";

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDoctorProfile();
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      const message =
        err.response?.data?.detail ||
        "Failed to load profile. Please try again.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: DoctorProfileUpdateData) => {
    setSaving(true);

    try {
      const updatedProfile = await updateDoctorProfile(updates);
      setProfile(updatedProfile);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const message =
        err.response?.data?.detail ||
        "Failed to update profile. Please try again.";
      showToast(
        typeof message === "string" ? message : "Failed to update profile",
        "error",
      );
      throw err; // Re-throw to keep edit mode open
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-900 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">
            View and manage your professional information
          </p>
        </motion.div>

        {/* Profile Content */}
        {isEditing ? (
          <DoctorProfileEdit
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        ) : (
          <DoctorProfileView
            profile={profile}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}
