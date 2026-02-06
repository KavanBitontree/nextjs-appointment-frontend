/**
 * Validate Reset Token API Route
 * Server-side handler for validating password reset tokens
 */

import { NextRequest, NextResponse } from "next/server";
import { validateResetToken } from "@/lib/password_reset_api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Validate token
    const result = await validateResetToken(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Token validation error:", error);

    return NextResponse.json(
      {
        error: error.message || "Invalid or expired token",
      },
      { status: error.status || 400 },
    );
  }
}
