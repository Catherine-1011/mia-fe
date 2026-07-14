"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  CONSENT_CHANGED_EVENT,
  GA_MEASUREMENT_ID,
  getStoredConsent,
  type ConsentChoice,
} from "@/lib/consent";

type ConsentChangedDetail = { choice: ConsentChoice };

/** Load GA4 and Inspectlet only after the visitor explicitly opts in. */
export default function GoogleAnalytics() {
  const consent = useSyncExternalStore(
    (notify) => {
      const handleConsentChange = (event: Event) => {
        const { choice } = (event as CustomEvent<ConsentChangedDetail>).detail;
        const analyticsWindow = window as Window & {
          __inspld?: number;
          gtag?: (...args: unknown[]) => void;
        };
        const analyticsWasLoaded =
          typeof analyticsWindow.gtag === "function" ||
          analyticsWindow.__inspld === 1;

        // Executed third-party scripts cannot be reliably unloaded. A reload is
        // needed only when a visitor revokes consent after analytics was loaded.
        if (choice === "denied" && analyticsWasLoaded) {
          window.location.reload();
          return;
        }

        notify();
      };

      window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
      return () =>
        window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    },
    getStoredConsent,
    () => null,
  );

  if (consent !== "granted") return null;

  return (
    <>
      <Script id="ga-consent-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', { 'analytics_storage': 'granted' });
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="inspectlet" strategy="afterInteractive">
        {`
          window.__insp = window.__insp || [];
          window.__insp.push(["wid", 1771092486]);
          (function() {
            function ldinsp() {
              if (typeof window.__inspld !== "undefined") return;
              window.__inspld = 1;
              var insp = document.createElement("script");
              insp.type = "text/javascript";
              insp.async = true;
              insp.id = "inspsync";
              insp.src = "https://cdn.inspectlet.com/inspectlet.js?wid=1771092486&r=" + Math.floor(new Date().getTime() / 3600000);
              document.head.appendChild(insp);
            }
            ldinsp();
          })();
        `}
      </Script>
    </>
  );
}
