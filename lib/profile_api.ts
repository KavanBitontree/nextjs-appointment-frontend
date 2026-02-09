/**
 * Profile API functions
 */

import { api } from "@/lib/axios";
import type {
  DoctorProfile,
  PatientProfile,
  DoctorProfileUpdateData,
  PatientProfileUpdateData,
} from "@/types/profile";

/**
 * Get doctor profile
 */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  const { data } = await api.get<DoctorProfile>("/profile/doctor");
  return data;
}

/**
 * Update doctor profile
 */
export async function updateDoctorProfile(
  updates: DoctorProfileUpdateData,
): Promise<DoctorProfile> {
  const { data } = await api.patch<DoctorProfile>("/profile/doctor", updates);
  return data;
}

/**
 * Get patient profile
 */
export async function getPatientProfile(): Promise<PatientProfile> {
  const { data } = await api.get<PatientProfile>("/profile/patient");
  return data;
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(
  updates: PatientProfileUpdateData,
): Promise<PatientProfile> {
  const { data } = await api.patch<PatientProfile>("/profile/patient", updates);
  return data;
}
