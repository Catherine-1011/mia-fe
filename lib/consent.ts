// lib/consent.ts
// Single source of truth for analytics consent configuration.

/** GA4 measurement ID — must match the ID in GoogleAnalytics.tsx */
export const GA_MEASUREMENT_ID = "G-EFXY9CYYQT";

/**
 * localStorage key that stores the user's consent choice.
 * Possible values: "granted" | "denied" | null (never asked).
 */
export const CONSENT_STORAGE_KEY = "ga_consent";

/** Name of the custom event used to re-open the consent banner. */
export const OPEN_CONSENT_BANNER_EVENT = "open-consent-banner";
export const CONSENT_CHANGED_EVENT = "analytics-consent-changed";

export type ConsentChoice = "granted" | "denied";

// gtag is injected globally by the GoogleAnalytics bootstrap script.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Read the stored consent choice (null if the user was never asked). */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

/**
 * Persist the user's choice and sync it to Google Consent Mode.
 * - "granted": tells gtag analytics_storage is allowed.
 * - "denied": explicitly sets it back to denied (matters when a user
 *   changes their mind via the footer "Privacy Preferences" link).
 */
export function applyConsent(choice: ConsentChoice): void {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  window.gtag?.("consent", "update", { analytics_storage: choice });

  if (choice === "denied") clearAnalyticsCookies();
  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGED_EVENT, { detail: { choice } }),
  );
}

/** Remove analytics cookies without touching authentication, cart, or checkout data. */
function clearAnalyticsCookies(): void {
  const prefixes = ["_ga", "_gid", "_gat", "__insp"];
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(
      (name): name is string =>
        Boolean(name) && prefixes.some((prefix) => name.startsWith(prefix)),
    );

  const domain = window.location.hostname;
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}; SameSite=Lax`;
  }
}

/** Re-open the consent banner (used by the footer "Privacy Preferences" link). */
export function openConsentBanner(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_BANNER_EVENT));
}
