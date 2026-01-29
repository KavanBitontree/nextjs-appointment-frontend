"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, MapPin } from "lucide-react";

interface Appointment {
  id: number;
  doctor_name: string;
  speciality: string;
  date: string;
  time: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    doctor_name: "Dr. Rajesh Kumar",
    speciality: "Cardiologist",
    date: "2024-02-10",
    time: "10:00 AM",
    location: "City Hospital, Delhi",
    status: "scheduled",
  },
  {
    id: 2,
    doctor_name: "Dr. Priya Singh",
    speciality: "General Physician",
    date: "2024-01-25",
    time: "02:30 PM",
    location: "Apollo Clinic, Delhi",
    status: "completed",
  },
  {
    id: 3,
    doctor_name: "Dr. Arjun Patel",
    speciality: "Dermatologist",
    date: "2024-01-20",
    time: "11:00 AM",
    location: "Skin Care Center, Delhi",
    status: "cancelled",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function PatientAppointments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Appointments
        </h1>
        <p className="text-slate-700">View and manage your appointment history</p>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {mockAppointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-slate-900">
                    {appointment.doctor_name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  {appointment.speciality}
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{appointment.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {mockAppointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-50 rounded-2xl p-12 border border-slate-200 text-center"
        >
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No appointments found</p>
        </motion.div>
      )}
    </motion.div>
  );
}
