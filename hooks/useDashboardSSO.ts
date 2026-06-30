// hooks/useDashboardSSO.ts
"use client";

import { useState, useCallback } from "react";

const API_BASE_URL = "https://backend.madeinarnhemland.com.au/api";
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


    try {
      const res = await fetch(`${API_BASE_URL}/auth/create-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });



      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[SSO] FAILED at create-ticket:", res.status, errData);
        throw new Error(errData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      const ticketId: string = data.ticketId ?? data.ticket ?? data.id;


      if (!ticketId) {

        throw new Error("No ticketId returned from server.");
      }

      // Build the callback URL with the ticket and the intended destination
      const callbackUrl = new URL(`${DASHBOARD_BASE_URL}/login-callback`);
      callbackUrl.searchParams.set("ticket", ticketId);
      callbackUrl.searchParams.set("redirectTo", redirectTo);

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
