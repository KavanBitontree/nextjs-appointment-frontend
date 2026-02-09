"use client";

import React, { useEffect } from "react";
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
  const { notificationStatus, markAsSeen } = useAppointmentNotifications(
    "doctor",
    "/doctor/appointments", // Toast will navigate here when clicked
  );

  // Mark as seen ONLY when user is actually on the appointments page
  useEffect(() => {
    if (pathname === "/doctor/appointments") {
      markAsSeen();
    }
  }, [pathname, markAsSeen]);

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
