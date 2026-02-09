/**
 * Forgot Password API Route
 * Server-side handler for password reset requests
 */

import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password_reset_api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Request password reset
    const result = await requestPasswordReset(email);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to process password reset request",
      },
      { status: error.status || 500 },
    );
  }
}
