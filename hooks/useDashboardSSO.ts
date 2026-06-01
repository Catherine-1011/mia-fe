// hooks/useDashboardSSO.ts
"use client";

import { useState, useCallback } from "react";

const API_BASE_URL = "http://134.199.161.119:5000/api";
const DASHBOARD_BASE_URL = "http://dashboard.madeinarnhemland.com.au";

/**
 * SSO handshake hook — creates a one-time ticket on the backend and
 * redirects the user to the Dashboard's /login-callback endpoint so it
 * can exchange the ticket for its own session.
 *
 * Usage:
 *   const { redirectToDashboard, isRedirecting } = useDashboardSSO();
 *   <button onClick={() => redirectToDashboard("/dashboard/customer/profile")}>
 *     My Profile
 *   </button>
 */
export function useDashboardSSO() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectToDashboard = useCallback(async (redirectTo: string = "/") => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("alpa_token")
        : null;

    // If the user is not logged in, send them to the dashboard login page directly
    if (!token) {
      window.location.href = `${DASHBOARD_BASE_URL}/login`;
      return;
    }

    setIsRedirecting(true);
    console.log("[SSO] Step 1: Token found, calling create-ticket...");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/create-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      console.log("[SSO] Step 2: create-ticket response status:", res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[SSO] FAILED at create-ticket:", res.status, errData);
        throw new Error(errData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[SSO] Step 3: Raw response from backend:", data);

      const ticketId: string = data.ticketId ?? data.ticket ?? data.id;
      console.log("[SSO] Step 4: Extracted ticketId:", ticketId);

      if (!ticketId) {
        console.error("[SSO] FAILED: No ticketId found in response. Keys received:", Object.keys(data));
        throw new Error("No ticketId returned from server.");
      }

      // Build the callback URL with the ticket and the intended destination
      const callbackUrl = new URL(`${DASHBOARD_BASE_URL}/login-callback`);
      callbackUrl.searchParams.set("ticket", ticketId);
      callbackUrl.searchParams.set("redirectTo", redirectTo);

      console.log("[SSO] Step 5: Redirecting to:", callbackUrl.toString());
      window.location.href = callbackUrl.toString();
    } catch (err) {
      console.error("[SSO] FALLBACK triggered because of error:", err);
      console.warn("[SSO] Sending user directly to dashboard (no SSO) — they will be asked to log in there.");
      window.location.href = `${DASHBOARD_BASE_URL}${redirectTo}`;
    } finally {
      setIsRedirecting(false);
    }
  }, []);

  return { redirectToDashboard, isRedirecting };
}
