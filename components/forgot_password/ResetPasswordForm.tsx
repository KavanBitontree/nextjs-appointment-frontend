"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      setValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength(null);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStrength("weak");
    } else if (newPassword.length < 12) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  }, [newPassword]);

  const validateToken = async () => {
    try {
      const response = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Invalid or expired token");
      }

      setTokenValid(true);
    } catch (err: any) {
      setError(
        "This reset link has expired or is invalid. Please request a new password reset.",
      );
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="text-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
        <p className="text-sm text-slate-600">Validating reset link...</p>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Invalid Reset Link
        </h3>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Password Reset Successful!
        </h3>
        <p className="text-slate-600 mb-4">
          Your password has been updated successfully.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Redirecting to login page...
        </p>
        <div className="h-1 w-48 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-green-600 animate-[progress_3s_ease-in-out]" />
        </div>
      </div>
    );
  }

  // Password strength colors
  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
            placeholder="Enter new password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              <div
                className={`h-1 flex-1 rounded ${
                  passwordStrength === "weak"
                    ? strengthColors.weak
                    : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded ${
                  passwordStrength === "medium" || passwordStrength === "strong"
                    ? passwordStrength === "medium"
                      ? strengthColors.medium
                      : strengthColors.strong
                    : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded ${
                  passwordStrength === "strong"
                    ? strengthColors.strong
                    : "bg-slate-200"
                }`}
              />
            </div>
            <p className="text-xs text-slate-600 capitalize">
              Password strength: {passwordStrength}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
            placeholder="Confirm new password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword && (
          <p
            className={`mt-2 text-xs ${
              newPassword === confirmPassword
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {newPassword === confirmPassword
              ? "✓ Passwords match"
              : "✗ Passwords do not match"}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          loading ||
          !newPassword ||
          !confirmPassword ||
          newPassword !== confirmPassword ||
          newPassword.length < 8
        }
        className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Resetting Password...
          </div>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}
