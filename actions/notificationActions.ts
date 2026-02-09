/**
 * Server Actions for Appointment Notifications
 *
 * Logic:
 * - REQUESTED (doctors): Always show - they need to approve (action required)
 * - APPROVED (patients): Always show - they need to pay (action required)
 * - REJECTED: Only show if updated within last 7 days (informational)
 * - PAID: Only show if updated within last 7 days (informational)
 *
 * This ensures action-required notifications always show, while
 * informational notifications only show for recent updates
 */

"use server";

import {
  getDoctorAppointments,
  getPatientAppointments,
} from "@/lib/appointments_api";

export type NotificationStatus = "none" | "red" | "yellow" | "green";

export interface NotificationData {
  status: NotificationStatus;
  counts: {
    rejected: number;
    requested: number;
    approved: number;
    paid: number;
  };
  message: string;
  role: "doctor" | "patient";
}

/**
 * Check if an appointment was updated within the last 7 days
 * Handles UTC timestamps from server and compares with current UTC time
 * 
 * IST (UTC+5:30) is automatically handled by JavaScript Date objects
 * All comparisons are done in UTC milliseconds for accuracy
 */
function isRecentlyUpdated(updatedAtUTC: string | null | undefined): boolean {
  if (!updatedAtUTC) {
    console.log("⚠️ No updated_at value provided");
    return false;
  }

  try {
    // Parse the UTC timestamp from database
    const updatedDate = new Date(updatedAtUTC);
    
    // Get current time (will be in UTC on Vercel server)
    const now = new Date();

    if (isNaN(updatedDate.getTime())) {
      console.log("⚠️ Invalid date format:", updatedAtUTC);
      return false;
    }

    // Calculate the difference in milliseconds (timezone-independent)
    const diffMs = now.getTime() - updatedDate.getTime();

    // Convert to hours
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    // Allow appointments up to 1 hour in the future (handles clock skew)
    // Show notifications for updates within last 7 days (168 hours)
    const isRecent = diffHours <= 168 && diffHours >= -1;

    console.log("📅 Date check (UTC comparison):", {
      updatedAt: updatedAtUTC,
      updatedDateUTC: updatedDate.toISOString(),
      updatedDateLocal: updatedDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      nowUTC: now.toISOString(),
      nowLocal: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      diffHours: diffHours.toFixed(2),
      diffDays: diffDays.toFixed(2),
      isRecent,
      reason: !isRecent 
        ? (diffHours > 168 ? 'Too old (>7 days)' : 'In future (>1 hour)')
        : 'Within 7 days',
    });

    return isRecent;
  } catch (error) {
    console.error("❌ Error parsing date:", error);
    return false;
  }
}

/**
 * Get notification data for the current user
 * This is a Server Action - runs on the server
 */
export async function getAppointmentNotifications(
  role: "doctor" | "patient",
): Promise<NotificationData> {
  try {
    console.log("🔍 Fetching appointments for role:", role);

    // Use existing server-side API functions
    const response =
      role === "doctor"
        ? await getDoctorAppointments({ page: 1, page_size: 100 })
        : await getPatientAppointments({ page: 1, page_size: 100 });

    const appointments = response.appointments || [];

    console.log(`📋 Found ${appointments.length} total appointments`);

    // Count appointments that need attention
    const counts = {
      rejected: 0,
      requested: 0,
      approved: 0,
      paid: 0,
    };

    // Track appointments by status for debugging
    const statusBreakdown: Record<string, number> = {};

    appointments.forEach((apt: any) => {
      const status = apt.status;
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      console.log(`📌 Processing appointment:`, {
        id: apt.id,
        status: apt.status,
        updated_at: apt.updated_at,
      });

      switch (apt.status) {
        case "REJECTED":
          // Only show recent rejections (informational)
          const recentlyRejected = isRecentlyUpdated(apt.updated_at);
          if (recentlyRejected) {
            counts.rejected++;
            console.log("✅ Counted REJECTED appointment");
          } else {
            console.log("⏭️ Skipped old REJECTED appointment");
          }
          break;

        case "REQUESTED":
          // For doctors: Show ALL REQUESTED appointments (they need to approve)
          // Don't filter by date - these need action regardless of when requested
          if (role === "doctor") {
            counts.requested++;
            console.log("✅ Counted REQUESTED appointment for doctor");
          } else {
            console.log("⏭️ Skipped REQUESTED appointment for patient");
          }
          break;

        case "APPROVED":
          // For patients: Show ALL APPROVED appointments (they need to pay)
          // Don't filter by date - these need action regardless of when approved
          if (role === "patient") {
            counts.approved++;
            console.log("✅ Counted APPROVED appointment for patient");
          } else {
            console.log("⏭️ Skipped APPROVED appointment for doctor");
          }
          break;

        case "PAID":
          // Only show recent payments (informational)
          const recentlyPaid = isRecentlyUpdated(apt.updated_at);
          if (recentlyPaid) {
            counts.paid++;
            console.log("✅ Counted PAID appointment (recent)");
          } else {
            console.log(
              "⏭️ Skipped PAID appointment (older than 7 days)",
              apt.updated_at,
            );
          }
          break;

        default:
          console.log("⚠️ Unknown appointment status:", apt.status);
      }
    });

    console.log("📊 Status breakdown:", statusBreakdown);
    console.log("📈 Final counts:", counts);

    // Calculate notification status based on priority
    let status: NotificationStatus = "none";
    let message = "";

    // Highest priority: Rejections (always bad news)
    if (counts.rejected > 0) {
      status = "red";
      message =
        role === "doctor"
          ? `${counts.rejected} appointment${counts.rejected > 1 ? "s" : ""} rejected`
          : `${counts.rejected} appointment${counts.rejected > 1 ? "s were" : " was"} rejected`;
    }
    // Doctor-specific notifications
    else if (role === "doctor") {
      // Medium priority: Pending requests (need action)
      if (counts.requested > 0) {
        status = "yellow";
        message = `${counts.requested} appointment${counts.requested > 1 ? "s" : ""} pending approval`;
      }
      // Low priority: New payments (informational)
      else if (counts.paid > 0) {
        status = "green";
        message = `${counts.paid} new paid appointment${counts.paid > 1 ? "s" : ""}`;
      }
    }
    // Patient-specific notifications
    else {
      // Medium priority: Approved appointments (need payment)
      if (counts.approved > 0) {
        status = "yellow";
        message = `${counts.approved} appointment${counts.approved > 1 ? "s" : ""} awaiting payment`;
      }
      // Low priority: Confirmed appointments (informational)
      else if (counts.paid > 0) {
        status = "green";
        message = `${counts.paid} appointment${counts.paid > 1 ? "s" : ""} confirmed`;
      }
    }

    console.log("🎯 Final notification status:", { status, message });

    return {
      status,
      counts,
      message,
      role,
    };
  } catch (error) {
    console.error("❌ Error fetching appointment notifications:", error);
    return {
      status: "none",
      counts: { rejected: 0, requested: 0, approved: 0, paid: 0 },
      message: "",
      role,
    };
  }
}
