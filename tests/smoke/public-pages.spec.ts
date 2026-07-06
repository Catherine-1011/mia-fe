import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/shop",
  "/cart",
  "/checkout",
  "/seller-login",
  "/contact-us",
  "/guest/track-order",
  "/privacy",
  "/shipping-policy",
  "/logout-callback",
];

const ignoredConsoleFragments = [
  "Download the React DevTools",
  "baseline-browser-mapping",
];

function isImportantRequest(url: string, resourceType: string) {
  if (["document", "script", "stylesheet", "image", "font"].includes(resourceType)) {
    return true;
  }

  return (
    url.includes("localhost:3000") ||
    url.includes("madeinarnhemland.com.au") ||
    url.includes("backend.madeinarnhemland.com.au")
  );
}

for (const route of routes) {
  test(`public smoke: ${route}`, async ({ page }) => {
    const failures: string[] = [];

    page.on("pageerror", (error) => {
      failures.push(`pageerror: ${error.message}`);
    });

    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (ignoredConsoleFragments.some((fragment) => text.includes(fragment))) return;
      failures.push(`console error: ${text}`);
    });

    page.on("requestfailed", (request) => {
      const url = request.url();
      const resourceType = request.resourceType();
      if (!isImportantRequest(url, resourceType)) return;
      failures.push(`request failed: ${request.method()} ${url} (${request.failure()?.errorText || "unknown"})`);
    });

    page.on("response", (response) => {
      const request = response.request();
      const url = response.url();
      const resourceType = request.resourceType();
      if (!isImportantRequest(url, resourceType)) return;
      if (response.status() < 400) return;
      if (["xhr", "fetch"].includes(resourceType) && [401, 403, 404].includes(response.status())) return;
      failures.push(`bad response: ${response.status()} ${request.method()} ${url}`);
    });

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should load`).toBe(true);
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);

    const brokenImages = await page.evaluate(() =>
      Array.from(document.images)
        .filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc)
    );

    expect(brokenImages, `${route} should not render broken images`).toEqual([]);
    expect(failures, `${route} should have no browser smoke failures`).toEqual([]);
  });
}
