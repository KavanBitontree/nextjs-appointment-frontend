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
    } catch (error) {
      console.error("Error loading user:", error);
      clearAuthData();
      setUser(null);
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
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Log for debugging
    console.log("🔐 AuthGuard Check:", {
      pathname,
      loading,
      isAuthenticated,
      role,
      allowedRoles,
      hasToken: !!getAccessToken(),
    });

    // Still loading - don't do anything yet
    if (loading) {
      setShouldRender(false);
      return;
    }

    // Check if we have a token but no user yet (shouldn't happen, but defensive)
    const token = getAccessToken();
    if (token && !isAuthenticated) {
      console.log("⚠️ Have token but not authenticated, waiting...");
      setShouldRender(false);
      return;
    }

    // Not authenticated and no token - redirect to login
    if (!isAuthenticated && !token) {
      console.log("❌ Not authenticated, redirecting to login");
      setShouldRender(false);
      router.replace("/login");
      return;
    }

    // Authenticated but no role yet - wait
    if (isAuthenticated && !role) {
      console.log("⏳ Authenticated but no role yet, waiting...");
      setShouldRender(false);
      return;
    }

    // Check role permissions
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      console.log("🚫 Wrong role, redirecting to dashboard");
      setShouldRender(false);
      router.replace(getDashboardPath(role));
      return;
    }

    // All checks passed - render content
    console.log("✅ Auth check passed, rendering content");
    setShouldRender(true);
  }, [allowedRoles, isAuthenticated, loading, role, router, pathname]);

  // Show loading spinner
  if (loading || !shouldRender) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
