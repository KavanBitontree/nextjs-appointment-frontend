/**
 * Client-side hook to manage appointment notifications
 * Shows toast ONCE per login session for appointments that need action
 *
 * FIXED ISSUES:
 * 1. Badge visibility on page reload
 * 2. Toast showing on fresh login
 * 3. Better session storage state management
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { getAppointmentNotifications } from "@/actions/notificationActions";
import type {
  NotificationStatus,
  NotificationData,
} from "@/actions/notificationActions";

interface UseAppointmentNotificationsReturn {
  notificationStatus: NotificationStatus;
  markAsSeen: () => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

/**
 * Custom hook for appointment notifications with toast
 * @param role - 'doctor' or 'patient'
 * @param appointmentsPath - Path to appointments page (e.g., '/doctor/appointments')
 */
export function useAppointmentNotifications(
  role: "doctor" | "patient",
  appointmentsPath: string,
): UseAppointmentNotificationsReturn {
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationStatus>("none");
  const [loading, setLoading] = useState(true);
  const { showAppointmentToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Use ref to track if initial fetch has happened to prevent double-fetching
  const initialFetchDone = useRef(false);

  // Session storage keys
  const BADGE_SEEN_KEY = `appointment_badge_seen_${role}`;
  const TOAST_SHOWN_KEY = `appointment_toast_shown_${role}`;

  const fetchNotificationStatus = async (shouldShowToast: boolean = false) => {
    try {
      setLoading(true);

      // Call Server Action
      const data: NotificationData = await getAppointmentNotifications(role);

      console.log("📊 Notification data fetched:", {
        role,
        status: data.status,
        message: data.message,
        counts: data.counts,
        shouldShowToast,
      });

      // Check if badge was dismissed (user visited appointments page)
      const badgeDismissed = sessionStorage.getItem(BADGE_SEEN_KEY) === "true";

      // FIXED: Show badge UNLESS explicitly dismissed
      // On fresh login, badgeDismissed will be false, so badge will show
      const finalStatus = badgeDismissed ? "none" : data.status;

      console.log("🎯 Badge status:", {
        badgeDismissed,
        dataStatus: data.status,
        finalStatus,
        badgeSeenValue: sessionStorage.getItem(BADGE_SEEN_KEY),
      });

      setNotificationStatus(finalStatus);

      // Show toast only if:
      // 1. shouldShowToast is true (initial load only)
      // 2. There are notifications (data.status !== "none")
      // 3. Toast hasn't been shown yet in this session
      if (shouldShowToast && data.status !== "none") {
        const toastShown = sessionStorage.getItem(TOAST_SHOWN_KEY) === "true";

        console.log("🍞 Toast check:", {
          toastShown,
          toastShownValue: sessionStorage.getItem(TOAST_SHOWN_KEY),
          willShow: !toastShown,
        });

        if (!toastShown) {
          console.log("✅ Showing toast:", data.message);
          showAppointmentToast(
            data.message,
            data.status,
            appointmentsPath,
            10000, // 10 seconds
          );
          sessionStorage.setItem(TOAST_SHOWN_KEY, "true");
        } else {
          console.log("⏭️ Toast already shown this session, skipping");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching appointment notifications:", error);
      setNotificationStatus("none");
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = () => {
    console.log("👁️ Marking notifications as seen");
    // Mark both badge and toast as seen when user visits appointments page
    sessionStorage.setItem(BADGE_SEEN_KEY, "true");
    sessionStorage.setItem(TOAST_SHOWN_KEY, "true");
    setNotificationStatus("none");
  };

  const refresh = async () => {
    console.log("🔄 Refreshing notifications (without toast)");
    // Refresh without showing toast
    await fetchNotificationStatus(false);
  };

  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) {
      console.log("⏳ Waiting for authentication...");
      return;
    }

    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      console.log("⏸️ User not authenticated, skipping notification fetch");
      setLoading(false);
      return;
    }

    // Prevent double-fetching in strict mode
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    console.log("🚀 Initial notification fetch for role:", role);

    // Small delay to ensure sessionStorage is cleared on fresh login
    // This gives AuthContext time to clear notification storage
    const timer = setTimeout(() => {
      // On mount, fetch and potentially show toast (only once per session)
      fetchNotificationStatus(true);
    }, 300); // Small delay to ensure auth state is ready

    // Poll every 30 seconds for updates (without showing toast)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        console.log("⏰ Polling for notification updates");
        fetchNotificationStatus(false);
      }
    }, 30000);

    return () => {
      console.log("🧹 Cleaning up notification polling");
      clearTimeout(timer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isAuthenticated, authLoading]);

  return {
    notificationStatus,
    markAsSeen,
    refresh,
    loading,
  };
}
