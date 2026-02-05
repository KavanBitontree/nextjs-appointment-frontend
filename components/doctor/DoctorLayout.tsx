"use client";

import React from "react";
import { CalendarDays, LayoutGrid, CalendarCheck2 } from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import type { NavItem } from "@/components/shared/Sidebar";

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
  },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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


