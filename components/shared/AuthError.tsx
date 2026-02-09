"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthError({ message }: { message: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const handleRefresh = () => {
    setRetrying(true);
    // Try reloading first
    window.location.reload();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  // Auto-redirect to login after a delay if still having issues
  useEffect(() => {
    const timer = setTimeout(() => {
      if (retrying) {
        router.push("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [retrying, router]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
      <p className="font-medium mb-2">Authentication Required</p>
      <p className="text-sm mb-4">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={handleRefresh}
          disabled={retrying}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {retrying ? "Refreshing..." : "Refresh Page"}
        </button>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
