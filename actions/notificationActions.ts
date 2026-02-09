/**
 * Server Actions for Appointment Notifications
 *
 * Logic:
 * - All statuses: Only show if updated within last 24 hours
 * - REQUESTED (doctors): Show recent requests - they need to approve
 * - APPROVED (patients): Show recent approvals - they need to pay
 * - REJECTED: Show recent rejections (informational)
 * - PAID: Show recent payments (informational)
 *
 * FIXED: Now tolerates appointments slightly in the future (up to 1 hour)
 * to handle clock skew and timezone issues
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
 * Check if an appointment was updated within the last 24 hours
 * Used for informational notifications (REJECTED, PAID)
 *
 * FIXED: Now allows appointments up to 1 hour in the future to handle:
 * - Clock skew between servers
 * - Timezone conversion issues
 * - Race conditions during appointment creation
 */
function isRecentlyUpdated(updatedAtUTC: string | null | undefined): boolean {
  if (!updatedAtUTC) {
    console.log("⚠️ No updated_at value provided");
    return false;
  }

  try {
    const updatedDate = new Date(updatedAtUTC);
    const now = new Date();

    if (isNaN(updatedDate.getTime())) {
      console.log("⚠️ Invalid date format:", updatedAtUTC);
      return false;
    }

    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - updatedDate.getTime();

    // Convert to hours
    const diffHours = diffMs / (1000 * 60 * 60);

    // FIXED: Allow appointments up to 1 hour in the future (negative diffHours)
    // This handles clock skew and timezone issues
    // Original: diffHours >= 0 (rejected future dates)
    // New: diffHours >= -1 (allows up to 1 hour in future)
    const isRecent = diffHours <= 24 && diffHours >= -1;

    console.log("📅 Date check:", {
      updatedAt: updatedAtUTC,
      updatedDate: updatedDate.toISOString(),
      now: now.toISOString(),
      diffHours: diffHours.toFixed(2),
      isRecent,
      isPast: diffHours >= 0,
      isFuture: diffHours < 0,
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
          // For doctors: Show REQUESTED appointments updated in last 24 hours (they need to approve)
          // For patients: Don't show (they already know they requested it)
          if (role === "doctor") {
            const recentlyRequested = isRecentlyUpdated(apt.updated_at);
            if (recentlyRequested) {
              counts.requested++;
              console.log("✅ Counted REQUESTED appointment for doctor");
            } else {
              console.log("⏭️ Skipped old REQUESTED appointment");
            }
          } else {
            console.log("⏭️ Skipped REQUESTED appointment for patient");
          }
          break;

        case "APPROVED":
          // For patients: Show APPROVED appointments updated in last 24 hours (they need to pay)
          // For doctors: Don't show (informational only)
          if (role === "patient") {
            const recentlyApproved = isRecentlyUpdated(apt.updated_at);
            if (recentlyApproved) {
              counts.approved++;
              console.log("✅ Counted APPROVED appointment for patient");
            } else {
              console.log("⏭️ Skipped old APPROVED appointment");
            }
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
              "⏭️ Skipped PAID appointment (older than 24 hours)",
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
