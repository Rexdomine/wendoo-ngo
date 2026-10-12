# Donate page handoff

Scope: REX-98. Static, script-free `donate.html` + isolated `donate.css`; uses the existing tracked logo. No payment provider, form, checkout, amount picker, invented URL or donation simulation. Currency cards are ordinary articles, not disabled controls. No deployment performed; maintenance and hosting configuration remain untouched.

## Preview and independent review

Serve this checkout using the existing project static-preview process. Open `/donate.html` (Vercel clean URLs additionally support `/donate`). If no managed runtime is configured, a reviewer can run `python3 -m http.server 4173 --bind 127.0.0.1` and open `http://127.0.0.1:4173/donate.html`. Keep any hosted preview protected; HTML noindex and existing response headers are retained. Noindex alone is not access control.

Parent integration owns the homepage and shared navigation: route Donate/support CTAs to `/donate.html`. This page uses the same navigation labels and links to existing homepage section IDs. Its current-page marker is `aria-current="page"`. Styles are isolated to prevent changes to concurrent homepage work.

StarLord should stage Product and independent Quality Engineering review: inspect at 1440px, 768px, 390px and 320px; verify no horizontal overflow, all three currencies and availability notices, readable text, loaded logo, keyboard skip link, visible focus, expandable questions, current navigation and homepage return anchors. Confirm that no card receives focus or acts like a payment action. Architecture can review technical risk; no specialist approval is claimed.

## Later payment-link activation (separate owner-authorized change)

The three `article[data-currency]` elements are the integration points. Once the owner supplies and approves destination URL(s):

1. Verify exact HTTPS destinations and supported currencies with the owner/provider. Do not infer currency support or alter provider query parameters.
2. For a single shared external page, add one clearly labelled link after the currency information, explaining that currency selection happens on the provider page. For separate destinations, replace each matching currency status with a descriptive anchor, e.g. “Donate in Nigerian naira (NGN)”. Leave unconfigured currencies unavailable.
3. Update availability notice and FAQ consistently; remove “coming soon” only for configured options. Label the external provider and handoff plainly. Same-tab links avoid unexpected new windows. No script or CSP change is necessary for standard external anchors.
4. Verify destinations, mobile layout, focus and labels before any authorized release. No payment details should be collected here.

No prices, conversion rates, recurring payments, tax claims or donation outcomes are promised. No URLs are currently configured. The unavailable state is the complete requested deliverable, not a dependency blocker.

## Focused verification

`node tests/donate-browser.cjs` uses Playwright (provided in the agent environment) and an installed Chromium binary. It starts a temporary loopback HTTP server with the repository response headers, checks 1440/768/390/320px rendered layouts, logo loading, no overflow, unavailable cards, keyboard skip link/FAQ and every local link/anchor, then closes browser and server. It saves screenshots when `PAPERCLIP_RUN_SCRATCH_DIR` is set. If Chromium is installed in a custom location, set `PLAYWRIGHT_BROWSERS_PATH` to that directory. No dependency or lockfile changes are required by the shipped page.

The existing `npm test` targets the maintenance page and currently fails at “Missing required copy: Website refresh in progress” against the concurrently edited homepage. No changes to that test or homepage are included here. Parent integration must reconcile the old maintenance test with its homepage delivery; this is not a Donate-page browser failure.

Verified 2026-10-05 with Chromium 151 / Playwright 1.62.1: all four viewport checks and local destination/anchor checks passed, with no browser errors or failed responses. Desktop (1440px) and mobile (390px) screenshots were visually inspected. This is implementation evidence, not independent Product/Quality Engineering approval.
