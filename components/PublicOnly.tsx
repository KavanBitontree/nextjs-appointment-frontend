"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export default function PublicOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, role } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Wait until auth is resolved
    if (loading) {
      setRedirecting(false);
      return;
    }

    // If authenticated, redirect to dashboard
    if (isAuthenticated && role) {
      const dashboardPath = getDashboardPath(role);
      // Only redirect if not already on the dashboard
      if (pathname !== dashboardPath && !redirecting) {
        setRedirecting(true);
        router.replace(dashboardPath);
      }
    } else {
      setRedirecting(false);
    }
  }, [isAuthenticated, loading, role, router, pathname, redirecting]);

  // Show loading state while checking auth or redirecting
  if (loading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">
            {loading ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading (will redirect)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


