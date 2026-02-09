"use client";

import React, { useEffect } from "react";
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
  const { notificationStatus, markAsSeen, loading: notificationsLoading } = useAppointmentNotifications(
    "patient",
    "/patient/appointments", // Toast will navigate here when clicked
  );

  // Debug notification status
  useEffect(() => {
    if (notificationStatus && notificationStatus !== "none") {
      console.log("🔔 Patient notification status:", {
        notificationStatus,
        loading: notificationsLoading,
        pathname,
        willShowBadge: notificationStatus !== "none",
      });
    }
  }, [notificationStatus, notificationsLoading, pathname]);

  // Mark as seen ONLY when user is actually on the appointments page
  useEffect(() => {
    if (pathname === "/patient/appointments") {
      markAsSeen();
    }
  }, [pathname, markAsSeen]);

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
