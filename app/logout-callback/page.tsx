"use client";
export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function LogoutCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // const doLogout = async () => {
    //   const token = localStorage.getItem("alpa_token");

    //   // 1. Invalidate the token server-side so it can't be reused for SSO tickets
    //   if (token) {
    //     try {
    //       await fetch("https://alpa-be-1.onrender.com/api/auth/logout", {
    //         method: "POST",
    //         credentials: "include",
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "Content-Type": "application/json",
    //         },
    //       });
    //     } catch (_) {
    //       // Best-effort — never block the logout flow
    //     }
    //   }

    //   // 2. Clear ALL Webapp session data (auth + seller-specific keys)
    //   localStorage.removeItem("alpa_token");
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("sellerToken");
    //   localStorage.removeItem("sellerOnboardingStep");
    //   localStorage.removeItem("sellerOnboardingFormData");
    //   localStorage.removeItem("sellerAbnVerified");

    //   // 3. Notify any in-tab listeners (e.g. CartContext)
    //   window.dispatchEvent(new CustomEvent("alpa-logout"));

    //   if (window.parent !== window) {
    //     // Legacy iframe path — notify the parent that we're done
    //     window.parent.postMessage("alpa-logout-done", "https://alpa-dashboard.vercel.app");
    //     return;
    //   }

    //   // 4. Redirect-based path — validate the redirect param against known origins
    //   const redirectParam = searchParams.get("redirect");
    //   const allowedOrigins = [
    //     "https://apla-fe.vercel.app",
    //     "https://alpa-dashboard.vercel.app",
    //   ];
    //   const isSafe =
    //     redirectParam && allowedOrigins.some((o) => redirectParam.startsWith(o));
    //   window.location.replace(isSafe ? redirectParam : "/");
    // };

    
    const doLogout = () => {
  const token = localStorage.getItem("alpa_token");

  // 1. Clear ALL Webapp session data FIRST — before the backend call so a
  //    cold Render server (can hang 30 s+ on free tier) never blocks logout.
  localStorage.removeItem("alpa_token");
  localStorage.removeItem("user");
  localStorage.removeItem("sellerToken");
  localStorage.removeItem("sellerOnboardingStep");
  localStorage.removeItem("sellerOnboardingFormData");
  localStorage.removeItem("sellerAbnVerified");

  // 2. Notify any in-tab listeners (e.g. CartContext)
  window.dispatchEvent(new CustomEvent("alpa-logout"));

  // 3. Fire-and-forget backend token invalidation — no await.
  if (token) {
    fetch("https://alpa-be-1.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).catch(() => { /* best-effort */ });
  }

  if (window.parent !== window) {
    window.parent.postMessage("alpa-logout-done", "https://alpa-dashboard.vercel.app");
    return;
  }

  // 4. Redirect
  const redirectParam = searchParams.get("redirect");
  const allowedOrigins = [
    "https://apla-fe.vercel.app",
    "https://alpa-dashboard.vercel.app",
  ];
  const isSafe =
    redirectParam && allowedOrigins.some((o) => redirectParam.startsWith(o));
  window.location.replace(isSafe ? redirectParam : "/");
};
    
    doLogout();
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Image
          src="/images/navbarLogo.png"
          alt="Alpa Logo"
          width={64}
          height={64}
          className="opacity-90"
        />

        {/* Spinner */}
        <div className="w-8 h-8 rounded-full border-2 border-[#5A1E12]/20 border-t-[#5A1E12] animate-spin" />

        {/* Text */}
        <div className="text-center">
          <p className="text-[#5A1E12] font-semibold text-base tracking-tight">
            Signing you out
          </p>
          <p className="text-gray-400 text-sm mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}

export default function LogoutCallbackPage() {
  return (
    <Suspense>
      <LogoutCallbackContent />
    </Suspense>
  );
}
