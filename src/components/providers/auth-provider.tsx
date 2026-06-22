"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { toast } from "sonner";

interface AuthContextType {
  loading: boolean;
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({ loading: true, user: null });

let _isSigningOut = false;
export function markSigningOut() { _isSigningOut = true; }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [lastWasAuthenticated, setLastWasAuthenticated] = useState(false);

  useEffect(() => {
    if (lastWasAuthenticated && !session && !isPending) {
      if (_isSigningOut) {
        _isSigningOut = false;
        toast.success("Signed out", { description: "You have been signed out successfully." });
      } else {
        toast.error("Session expired", { description: "Your session has expired. Please sign in again." });
      }
    }
    setLastWasAuthenticated(!!session);
  }, [session, isPending, lastWasAuthenticated]);

  return (
    <AuthContext.Provider value={{ loading: isPending, user: session?.user ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for client components that require guaranteed authentication.
 * - Returns { loading: true } while checking session
 * - Automatically redirects to /sign-in if not authenticated
 * - Returns { loading: false, user } when authenticated
 */
export function useRequireAuth() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Redirect to sign-in if not authenticated after loading
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  return {
    loading: isPending,
    user: session?.user ?? null,
  };
}

/**
 * Hook to get current auth state without enforcing authentication.
 * Useful for components that behave differently based on auth state.
 */
export function useOptionalAuth() {
  const { data: session, isPending } = useSession();

  return {
    loading: isPending,
    isAuthenticated: !!session,
    user: session?.user ?? null,
  };
}
