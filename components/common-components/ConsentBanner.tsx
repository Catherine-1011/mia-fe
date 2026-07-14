// components/common-components/ConsentBanner.tsx
// Cookie/GA4 consent banner.
//
// Behaviour:
//   - First visit (no 'ga_consent' value in localStorage): banner shows.
//   - "Yes"  -> stores 'granted' and loads analytics.
//   - "No"   -> stores 'denied'; analytics scripts stay unloaded. Revoking a
//               previous grant also clears cookies and unloads active trackers.
//   - No auto-close, no "X" button — the user must make an explicit choice.
//   - Listens for the OPEN_CONSENT_BANNER_EVENT custom event so the footer
//     "Privacy Preferences" link can re-open it at any time.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applyConsent,
  getStoredConsent,
  OPEN_CONSENT_BANNER_EVENT,
  type ConsentChoice,
} from "@/lib/consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show on first visit only — skip if the user already chose
    // 'granted' or 'denied' on a previous visit.
    if (getStoredConsent() === null) {
      setVisible(true);
    }

    // Re-open on demand (footer "Privacy Preferences" link), regardless
    // of what is stored, so users can change their earlier choice.
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_BANNER_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_BANNER_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    applyConsent(choice); // updates both localStorage and gtag consent state
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] bg-[#2B2B2B] text-white shadow-[0_-2px_12px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="flex-1 text-sm leading-relaxed">
          This site uses cookies and analytics tools to understand how visitors use our site 
and to improve your experience. Do you accept this? See our Privacy Policy for details.{" "}
          <Link
            href="/privacy"
            className="underline text-[#D9BFA9] hover:text-[#A48068] transition-colors"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Two buttons with equal size and visual weight — deliberately no
            "primary vs secondary" styling bias toward accepting. */}
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => choose("granted")}
            className="w-24 py-2 rounded-full border border-[#A48068] bg-transparent text-sm font-medium hover:bg-[#A48068] transition-colors"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className="w-24 py-2 rounded-full border border-[#A48068] bg-transparent text-sm font-medium hover:bg-[#A48068] transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
