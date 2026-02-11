import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    console.log("📥 API route called: /api/patient/appointments");

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "10";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // Build query string
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page);
    if (page_size) queryParams.append("page_size", page_size);
    if (status) queryParams.append("status", status);
    if (search) queryParams.append("search", search);

    const queryString = queryParams.toString();
    const endpoint = `/appointments/my-appointments${queryString ? `?${queryString}` : ""}`;

    console.log("🔍 Calling backend endpoint:", endpoint);

    // Get cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      console.error("❌ No access token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 },
      );
    }

    console.log("🔑 Access token found, making request...");

    // Forward all cookies to backend
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    // Call backend API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    console.log("📡 Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Backend error:", errorData);
      return NextResponse.json(
        {
          error: errorData.detail || response.statusText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("✅ Appointments fetched successfully:", {
      total: data.total,
      count: data.appointments?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ Error in appointments API route:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch appointments",
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
