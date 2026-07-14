// components/common-components/GoogleAnalytics.tsx
// Loads GA4 with Google Consent Mode v2.
//
// Order of operations (critical for compliance):
//   1. Inline script defines gtag() and sets the DEFAULT consent state to
//      "denied" BEFORE gtag.js is fetched, so no analytics cookies are set
//      for new visitors.
//   2. The same inline script checks localStorage for a prior choice and,
//      if the user granted consent on an earlier visit, immediately updates
//      consent to "granted" — returning users are never re-prompted here
//      (the banner itself also skips rendering for them).
//   3. gtag.js is then loaded and configured with the measurement ID.
//
// NOTE: the measurement ID and localStorage key below are duplicated from
// lib/consent.ts (GA_MEASUREMENT_ID / CONSENT_STORAGE_KEY) because this
// bootstrap must run as a raw inline script before hydration. Keep them
// in sync if you ever change either value.

import Script from "next/script";

const GA_MEASUREMENT_ID = "G-EFXY9CYYQT"; // keep in sync with lib/consent.ts
const CONSENT_STORAGE_KEY = "ga_consent"; // keep in sync with lib/consent.ts

export default function GoogleAnalytics() {
  return (
    <>
      {/* Step 1 & 2: consent defaults + returning-visitor restore.
          beforeInteractive guarantees this runs before gtag.js below. */}
      <Script id="ga-consent-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('js', new Date());

          // Default: analytics storage DENIED until the user opts in.
          gtag('consent', 'default', { 'analytics_storage': 'denied' });

          // Restore a previously granted choice so returning users are
          // tracked without being re-prompted.
          try {
            if (localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
              gtag('consent', 'update', { 'analytics_storage': 'granted' });
            }
          } catch (e) { /* localStorage unavailable (e.g. blocked) — stay denied */ }

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      {/* Step 3: load gtag.js AFTER the consent default is queued. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
