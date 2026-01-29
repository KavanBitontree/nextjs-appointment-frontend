export interface User {
  user_id: number;
  email: string;
  role: "patient" | "doctor";
  is_active: boolean;
}

// Auth response from backend
export interface AuthResponse {
  access_token: string;
  refresh_token?: string; // Optional, as it might be in HttpOnly cookie
  token_type: string;
  user_id: number;
  role: string;
  device_model?: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Patient signup request
export interface PatientSignupRequest {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  age: number;
}

// Doctor signup request
export interface DoctorSignupRequest {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  speciality: string;
  opd_fees: number;
  minimum_slot_duration: number;
}

// Session check response
export interface SessionCheckResponse {
  has_active_session: boolean;
  device_model?: string;
  last_login_at?: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Message response (for logout, etc.)
export interface MessageResponse {
  message: string;
}

// Device info
export interface DeviceInfo {
  device_model: string;
  device_fingerprint: string;
}

// JWT Payload (decoded token)
export interface JWTPayload {
  user_id: number;
  email: string;
  role: string;
  device_id: number;
  exp: number; // Expiration timestamp
}

// Error response from API
export interface APIError {
  detail: string | { [key: string]: any };
}
