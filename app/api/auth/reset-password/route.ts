/**
 * Reset Password API Route
 * Server-side handler for resetting password with token
 */

import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/password_reset_api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, new_password } = body;

    if (!token || !new_password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Reset password
    const result = await resetPassword(token, new_password);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to reset password",
      },
      { status: error.status || 500 },
    );
  }
}
