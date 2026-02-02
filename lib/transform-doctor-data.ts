/**
 * Transforms doctor data from API response format to frontend expected format
 */

interface ApiDoctorData {
  id: number;
  user_id: number;
  name: string;
  speciality: string;
  opd_fees: string;
  address: string;
  latitude: number;
  longitude: number;
  minimum_slot_duration: string;
}

interface ApiDoctorsResponse {
  doctors: ApiDoctorData[];
  total: number;
  skip: number;
  limit: number;
}

interface FrontendDoctorData {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  speciality?: string;
  clinic_address?: string;
  opd_fees?: number;
  qualification?: string;
  experience?: string;
  description?: string;
}

export interface FrontendDoctorsResponse {
  doctors: FrontendDoctorData[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Splits a full name into first and last name
 */
function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 0) {
    return { first_name: '', last_name: '' };
  }
  
  if (nameParts.length === 1) {
    return { first_name: nameParts[0], last_name: '' };
  }
  
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(' ');
  
  return { first_name, last_name };
}

/**
 * Transforms API doctor data to frontend expected format
 */
export function transformApiDoctorToClient(apiDoctor: ApiDoctorData): FrontendDoctorData {
  const { first_name, last_name } = splitFullName(apiDoctor.name);
  
  return {
    id: apiDoctor.id,
    first_name,
    last_name,
    speciality: apiDoctor.speciality,
    clinic_address: apiDoctor.address,
    opd_fees: parseFloat(apiDoctor.opd_fees),
    // These fields are not available in the API response, so we set them as optional
    email: undefined,
    phone: undefined,
    qualification: undefined,
    experience: undefined,
    description: undefined,
  };
}

/**
 * Transforms API doctors response to frontend expected format
 */
export function transformApiDoctorsResponse(apiResponse: ApiDoctorsResponse): FrontendDoctorsResponse {
  return {
    doctors: apiResponse.doctors.map(transformApiDoctorToClient),
    total: apiResponse.total,
    skip: apiResponse.skip,
    limit: apiResponse.limit,
  };
}