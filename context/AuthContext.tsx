"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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
  const { isAuthenticated, loading, role } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for loading to complete
    if (loading) {
      setIsChecking(true);
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace("/login");
      setIsChecking(false);
      return;
    }

    // Wait for role to be loaded before checking permissions
    if (isAuthenticated && !role) {
      setIsChecking(true);
      return; // Still loading user data
    }

    // Now check if role matches allowed roles
    // Only redirect if role is explicitly loaded and doesn't match
    if (isAuthenticated && role && allowedRoles && !allowedRoles.includes(role)) {
      console.log("[v0] Role mismatch:", role, "allowed:", allowedRoles);
      router.replace(getDashboardPath(role));
      setIsChecking(false);
      return;
    }

    console.log("[v0] AuthGuard: All checks passed for role:", role);
    // All checks passed
    setIsChecking(false);
  }, [allowedRoles, isAuthenticated, loading, role, router]);

  // Show loading during auth check OR while role is being loaded
  if (loading || isChecking || (isAuthenticated && !role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  // Don't render if wrong role
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
