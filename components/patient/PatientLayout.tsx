"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Calendar } from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import type { NavItem } from "@/components/shared/Sidebar";
import { useAppointmentNotifications } from "@/hooks/useAppointmentNotifications";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    notificationStatus,
    markAsSeen,
    loading: notificationsLoading,
  } = useAppointmentNotifications(
    "patient",
    "/patient/appointments", // Toast will navigate here when clicked
  );

  // Track if we've already marked as seen for this pathname
  const markedAsSeenRef = useRef<string | null>(null);

  // Debug notification status
  useEffect(() => {
    if (notificationStatus && notificationStatus !== "none") {
      console.log("🔔 Patient notification status:", {
        notificationStatus,
        loading: notificationsLoading,
        pathname,
        willShowBadge: true,
      });
    }
  }, [notificationStatus, notificationsLoading, pathname]);

  // Mark as seen ONLY when user is actually on the appointments page
  // FIXED: Remove markAsSeen from dependencies to prevent multiple calls
  useEffect(() => {
    if (
      pathname === "/patient/appointments" &&
      markedAsSeenRef.current !== pathname
    ) {
      console.log("📍 User navigated to appointments page - marking as seen");
      markedAsSeenRef.current = pathname;
      markAsSeen();
    } else if (pathname !== "/patient/appointments") {
      // Reset when leaving appointments page
      markedAsSeenRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only depend on pathname, not markAsSeen

  const patientNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5" />,
      href: "/patient/dashboard",
    },
    {
      label: "Doctors",
      icon: <Users className="w-5 h-5" />,
      href: "/patient/doctors",
    },
    {
      label: "Appointments",
      icon: <Calendar className="w-5 h-5" />,
      href: "/patient/appointments",
      notificationStatus, // Add notification status
    },
  ];

  return (
    <DashboardLayout
      navItems={patientNavItems}
      appName="Aarogya ABS"
      profileHref="/patient/profile"
    >
      {children}
    </DashboardLayout>
  );
}
