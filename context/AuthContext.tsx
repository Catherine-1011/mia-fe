// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { devLogger } from "@/lib/logger";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
  isVerified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUserDirect: (user: User) => void;
  logout: () => void;
  login: (userData: User, token?: string) => void;
  token: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  // Keep the server and initial client render identical. Restore browser
  // storage after hydration to avoid React hydration error #418.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage on mount (backup for SSR)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("alpa_token");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        devLogger.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch user profile using token
  const fetchUser = async () => {
    const currentToken = localStorage.getItem("alpa_token");
    
    if (!currentToken) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        "https://backend.madeinarnhemland.com.au/api/profile",
        {
          headers: { 
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!res.ok) {
        // If unauthorized, clear everything and redirect to home
        if (res.status === 401) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("alpa_token");
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
        return;
      }

      const data = await res.json();
      const userData = data.user || data;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      devLogger.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user whenever token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  // Directly set user (for login)
  const setUserDirect = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("alpa_token", authToken);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    // Notify CartContext (and any other listeners) that a login just happened.
    // StorageEvent does NOT fire within the same tab, so we use a custom event.
    const newToken = authToken ?? token ?? localStorage.getItem("alpa_token");
    if (newToken) {
      window.dispatchEvent(new CustomEvent("alpa-login", { detail: { token: newToken } }));
    }
  };

  // Login function
  const login = (userData: User, authToken?: string) => {
    setUserDirect(userData, authToken);
  };

  // Proper logout — clears Webapp session then hands off to Dashboard's
  // /logout-callback, which clears Dashboard session and redirects back to
  // Webapp's /login. No iframes needed — simple redirect chain.
  const logout = async () => {
    const currentToken = token || localStorage.getItem("alpa_token");

    // 1. Invalidate the token server-side (best-effort)
    if (currentToken) {
      try {
        await fetch("https://backend.madeinarnhemland.com.au/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        devLogger.error("Logout API error:", error);
      }
    }

    // 2. Clear ALL Webapp client-side state (auth + seller-specific keys)
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("alpa_token");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerOnboardingStep");
    localStorage.removeItem("sellerOnboardingFormData");
    localStorage.removeItem("sellerAbnVerified");

    // 3. Notify CartContext to clear guest state (same-tab)
    window.dispatchEvent(new CustomEvent("alpa-logout"));

    // 4. Remove all in-memory query data before leaving the current account.
    // This is intentionally logout-only; normal mutations use targeted updates.
    queryClient.clear();

    // 5. Redirect to Dashboard's /logout-callback, which will clear its own
    //    session and then redirect the user back to the main site.
    if (typeof window !== "undefined") {
      window.location.href =
        "http://dashboard.madeinarnhemland.com.au/logout-callback?redirect=" +
        encodeURIComponent("https://madeinarnhemland.com.au");
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        fetchUser, 
        setUserDirect, 
        logout,
        login,
        token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
