import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies (sent by browser automatically)
    let accessToken = request.cookies.get("access_token")?.value;

    // If no access token, try to refresh using refresh token
    if (!accessToken) {
      const refreshToken = request.cookies.get("refresh_token")?.value;
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `refresh_token=${refreshToken}`,
            },
            cache: "no-store",
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            accessToken = refreshData.access_token;
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { detail: "Unauthorized - No access token" },
        { status: 401 }
      );
    }

    // Get query parameters from request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/appointments/doctor-appointments${queryString ? `?${queryString}` : ""}`;

    // Forward all cookies to backend
    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.detail || response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in appointments API proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
