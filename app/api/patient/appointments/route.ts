import { NextRequest, NextResponse } from "next/server";
import { getPatientAppointments } from "@/lib/appointments_api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const page_size = parseInt(searchParams.get("page_size") || "10");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const response = await getPatientAppointments({
      page,
      page_size,
      status,
      search,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in appointments API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: error.status || 500 },
    );
  }
}
