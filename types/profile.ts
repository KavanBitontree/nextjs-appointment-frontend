/**
 * Profile-related TypeScript types
 */

export interface DoctorProfile {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  opd_fees: number;
  minimum_slot_duration: number;
  address: string | null;
  latitude: number;
  longitude: number;
  email: string;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  name: string;
  dob: string; // ISO date string
  age: number;
  email: string;
}

export interface DoctorProfileUpdateData {
  name?: string;
  speciality?: string;
  opd_fees?: number;
  minimum_slot_duration?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface PatientProfileUpdateData {
  name?: string;
  dob?: string; // ISO date string
}
