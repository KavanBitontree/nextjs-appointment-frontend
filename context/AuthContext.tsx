"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, clearAuthData, getAccessToken } from "@/lib/axios";
import type { User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: User["role"] | null;
  refreshUser: () => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const getDashboardPath = (role?: string | null) => {
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "patient") return "/patient/dashboard";
  return "/login";
};

// Helper function to clear all notification session storage
// FIXED: Now clears BOTH badge AND toast keys for both roles
const clearNotificationStorage = () => {
  // Clear badge keys
  sessionStorage.removeItem("appointment_badge_seen_doctor");
  sessionStorage.removeItem("appointment_badge_seen_patient");

  // Clear toast keys (THIS WAS MISSING!)
  sessionStorage.removeItem("appointment_toast_shown_doctor");
  sessionStorage.removeItem("appointment_toast_shown_patient");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadUser = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get<User>("/auth/me");

      const normalizedRole =
        typeof data.role === "string"
          ? (data.role.toLowerCase() as User["role"])
          : data.role;

      setUser({ ...data, role: normalizedRole });

      // REMOVED: Do NOT clear notification storage on login!
      // The storage should only be cleared on logout.
      // Clearing here prevents the toast from showing on fresh login.
    } catch (error) {
      console.error("Error loading user:", error);
      // Only clear auth data on 401 (unauthorized)
      if ((error as any)?.response?.status === 401) {
        clearAuthData();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // run ONCE on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    loadUser();
  }, [initialized, loadUser]);

  // sync logout across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" && !e.newValue) {
        setUser(null);
        router.replace("/login");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  const logout = useCallback(
    async (redirectTo?: string) => {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore network errors
      } finally {
        clearAuthData();
        clearNotificationStorage(); // Clear notifications on logout (CORRECT)
        setUser(null);
        router.replace(redirectTo || "/login");
      }
    },
    [router],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      refreshUser: loadUser,
      logout,
    }),
    [user, loading, loadUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Array<User["role"]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, role } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // ⛔ Wait until auth is resolved
    if (loading) {
      setRedirecting(false);
      return;
    }

    // ❌ Not authenticated - redirect to login
    if (!isAuthenticated) {
      if (pathname !== "/login" && !redirecting) {
        setRedirecting(true);
        router.replace("/login");
      }
      return;
    }

    // ⏳ Role not ready yet - wait
    if (!role) return;

    // 🚫 Role not allowed - redirect to correct dashboard
    if (allowedRoles && !allowedRoles.includes(role)) {
      const correctPath = getDashboardPath(role);
      if (pathname !== correctPath && !redirecting) {
        setRedirecting(true);
        router.replace(correctPath);
      }
    } else {
      // Role is allowed, stop redirecting
      setRedirecting(false);
    }
  }, [allowedRoles, isAuthenticated, loading, role, router, pathname, redirecting]);

  // Show loading state while checking auth or redirecting
  if (loading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">
            {loading ? "Verifying access..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
