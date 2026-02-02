"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";

interface PatientData {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string; // Using the API field name
  date_of_birth?: string; // For backward compatibility
  is_active?: boolean;
  created_at?: string;
  first_name?: string;
  last_name?: string;
}

interface PatientProfileProps {
  initialData?: PatientData | null;
}

export default function PatientProfile({ initialData }: PatientProfileProps) {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState<PatientData | null>(
    initialData || null,
  );
  const [loading, setLoading] = useState(!initialData && !!user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      // Skip if we already have initial data
      if (initialData) {
        setPatientData(initialData);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<PatientData>(
          `/patients/`, // Get current patient's data
        );

        // Map API response to expected component fields
        const mappedData = {
          ...response.data,
          // Map 'name' field to 'first_name' and 'last_name'
          first_name: response.data.name?.split(' ')[0],
          last_name: response.data.name?.split(' ').slice(1).join(' '),
          // Map 'dob' field to 'date_of_birth' for backward compatibility
          date_of_birth: response.data.dob || response.data.date_of_birth,
          // Use 'user_id' as 'id' if 'id' is not present
          id: response.data.id || response.data.user_id,
        };

        console.log("Fetched patient data:", mappedData);
        setPatientData(mappedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user?.user_id, initialData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader className="w-8 h-8 text-slate-900" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-700">Manage your account information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8 border border-slate-200 mb-6"
      >
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {patientData?.first_name || patientData?.name || patientData?.email || "Patient"}
            </h2>
            <p className="text-slate-600 mt-1">Patient Account</p>
            <p
              className={`text-xs font-semibold mt-2 px-3 py-1 rounded-full w-fit ${
                patientData?.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {patientData?.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 rounded-xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-slate-900" />
              <p className="text-sm text-slate-600 font-medium">Email</p>
            </div>
            <p className="text-lg font-semibold text-slate-900 break-all">
              {patientData?.email}
            </p>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 rounded-xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-slate-900" />
              <p className="text-sm text-slate-600 font-medium">Phone</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {patientData?.phone || "Not provided"}
            </p>
          </motion.div>

          {/* Date of Birth */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 rounded-xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-slate-900" />
              <p className="text-sm text-slate-600 font-medium">
                Date of Birth
              </p>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {patientData?.date_of_birth || "Not provided"}
            </p>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 rounded-xl p-4 border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-slate-900" />
              <p className="text-sm text-slate-600 font-medium">Address</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {patientData?.address || "Not provided"}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Account Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">User ID</p>
            <p className="text-sm font-semibold text-slate-900">
              {patientData?.id}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Member Since</p>
            <p className="text-sm font-semibold text-slate-900">
              {patientData?.created_at
                ? new Date(patientData.created_at).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
