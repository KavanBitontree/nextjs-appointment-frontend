"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export default function PublicOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, role } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace(getDashboardPath(role));
    }
  }, [isAuthenticated, loading, role, router]);

  if (loading) return null;
  if (isAuthenticated) return null;
  return <>{children}</>;
}


