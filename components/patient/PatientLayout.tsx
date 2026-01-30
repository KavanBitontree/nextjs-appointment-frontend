"use client";

import React from "react";
import { LayoutGrid, Users, Calendar } from "lucide-react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import type { NavItem } from "@/components/shared/Sidebar";

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
  },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
