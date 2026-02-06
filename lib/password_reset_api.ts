/**
 * Password Reset API Client
 * Server-side API calls for password reset functionality
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== TYPE DEFINITIONS ====================

export type PasswordResetResponse = {
  message: string;
  success: boolean;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};

export type TokenValidationResponse = {
  message: string;
  expires_at: string;
};

// ==================== API ERROR CLASS ====================

class PasswordResetAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "PasswordResetAPIError";
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Request password reset email
 * Server-side only - does not require authentication
 */
export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResponse> {
  const url = `${API_BASE_URL}/auth/forgot-password`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new PasswordResetAPIError(
      response.status,
      errorData.detail || "Failed to send reset email",
      errorData,
    );
  }

  return response.json();
}

/**
 * Validate password reset token
 * Server-side only - check if token is valid before showing reset form
 */
export async function validateResetToken(
  token: string,
): Promise<TokenValidationResponse> {
  const url = `${API_BASE_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new PasswordResetAPIError(
      response.status,
      errorData.detail || "Invalid or expired token",
      errorData,
    );
  }

  return response.json();
}

/**
 * Reset password with token
 * Server-side only - does not require authentication
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<PasswordResetResponse> {
  const url = `${API_BASE_URL}/auth/reset-password`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new PasswordResetAPIError(
      response.status,
      errorData.detail || "Failed to reset password",
      errorData,
    );
  }

  return response.json();
}
