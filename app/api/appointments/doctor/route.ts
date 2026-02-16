// This server-side API route is no longer needed
// All API calls should be made directly from client components using the axios instance
// which handles authentication via localStorage and automatic token refresh

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { 
      detail: "This endpoint is deprecated. Use client-side API calls instead." 
    },
    { status: 410 }
  );
}
