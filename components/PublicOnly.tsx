"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export default function PublicOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, role } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait until auth is resolved
    if (loading) {
      setHasRedirected(false);
      return;
    }

    // Add a small delay to prevent race conditions with AuthGuard
    // This ensures cookies are accessible before making redirect decisions
    const timer = setTimeout(() => {
      if (isAuthenticated && !hasRedirected && role) {
        const dashboardPath = getDashboardPath(role);
        // Only redirect if not already on the dashboard
        if (typeof window !== "undefined" && window.location.pathname !== dashboardPath) {
          setHasRedirected(true);
          router.replace(dashboardPath);
        }
      }
    }, 200); // Longer delay than AuthGuard to prevent conflicts

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, role, router, hasRedirected]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
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


