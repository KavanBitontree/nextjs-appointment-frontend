export function getPasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong";
  score: number;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) return { strength: "weak", score };
  if (score <= 4) return { strength: "medium", score };
  return { strength: "strong", score };
}

export function validateEmail(value: string): string | undefined {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

export function validateSignupPassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter";
  if (!/[0-9]/.test(value)) return "Add at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Add one special character";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value) return "Name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  return undefined;
}

export function validateDOB(dob: string): string | undefined {
  if (!dob) return "Date of birth is required";

  const dobDate = new Date(dob);
  const today = new Date();

  // Check if date is valid
  if (isNaN(dobDate.getTime())) return "Invalid date";

  // Check if date is not in the future
  if (dobDate > today) return "Date of birth cannot be in the future";

  // Calculate age
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dobDate.getDate())
  ) {
    age--;
  }

  // Validate age range
  if (age < 0) return "Invalid date of birth";
  if (age > 150) return "Date of birth indicates age over 150 years";
  if (age < 1) return "Must be at least 1 year old";

  return undefined;
}

export function calculateAge(dob: string): number {
  const dobDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dobDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return undefined;
}

export function validateSpeciality(value: string): string | undefined {
  if (!value) return "Speciality is required";
  if (value.length < 2) return "Speciality must be at least 2 characters";
  return undefined;
}

export function validateOpdFees(value: number): string | undefined {
  if (!value || value <= 0) return "OPD fees must be greater than 0";
  return undefined;
}

// Format date for input type="date"
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get max date for DOB (today)
export function getMaxDOB(): string {
  return formatDateForInput(new Date());
}

// Get min date for DOB (150 years ago)
export function getMinDOB(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 150);
  return formatDateForInput(date);
}

export function validateAddress(value: string): string | undefined {
  if (!value) return "Clinic address is required";
  if (value.length < 5) return "Enter a valid address";
  return undefined;
}

export function validateLatitude(value: number): string | undefined {
  if (typeof value !== "number" || isNaN(value)) return "Latitude is required";
  if (value < -90 || value > 90) return "Latitude must be between -90 and 90";
  return undefined;
}

export function validateLongitude(value: number): string | undefined {
  if (typeof value !== "number" || isNaN(value)) return "Longitude is required";
  if (value < -180 || value > 180)
    return "Longitude must be between -180 and 180";
  return undefined;
}
