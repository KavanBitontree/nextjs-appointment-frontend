"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, CalendarCheck2 } from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import type { NavItem } from "@/components/shared/Sidebar";
import { useAppointmentNotifications } from "@/hooks/useAppointmentNotifications";

export default function DoctorLayout({
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
    "doctor",
    "/doctor/appointments", // Toast will navigate here when clicked
  );

  // Track if we've already marked as seen for this pathname
  const markedAsSeenRef = useRef<string | null>(null);

  // Debug notification status
  useEffect(() => {
    if (notificationStatus && notificationStatus !== "none") {
      console.log("🔔 Doctor notification status:", {
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
      pathname === "/doctor/appointments" &&
      markedAsSeenRef.current !== pathname
    ) {
      console.log("📍 User navigated to appointments page - marking as seen");
      markedAsSeenRef.current = pathname;
      markAsSeen();
    } else if (pathname !== "/doctor/appointments") {
      // Reset when leaving appointments page
      markedAsSeenRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only depend on pathname, not markAsSeen

  const doctorNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5" />,
      href: "/doctor/dashboard",
    },
    {
      label: "Calendar",
      icon: <CalendarDays className="w-5 h-5" />,
      href: "/doctor/calendar",
    },
    {
      label: "Appointments",
      icon: <CalendarCheck2 className="w-5 h-5" />,
      href: "/doctor/appointments",
      notificationStatus, // Add notification status
    },
  ];

  return (
    <DashboardLayout
      navItems={doctorNavItems}
      appName="Aarogya ABS"
      profileHref="/doctor/profile"
    >
      {children}
    </DashboardLayout>
  );
}
