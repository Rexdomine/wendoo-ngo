# Our Programme handoff

Scope: `programme.html`, `programme.css`, and `tests/programme-browser.cjs`.

## Content and design

Uses the current homepage handoff's Identify → Mobilise → Deliver → Measure → Grow model, February 2023 launch statement, and funding constraint statement. No invented reach, impact numbers, delivery frequency, menus or school eligibility rules. Reuses supplied `assets/breakfast-together.jpg`; descriptive alt text was checked against the image. No generated media or public production notes.

Editorial type scale, curved photo, alternating sections, pill buttons, navigation labels and footer follow the homepage structure. Page CSS is isolated and applies the assignment's bone/green/teal/red palette. The current homepage is blue; StarLord must resolve this discrepancy during combined visual integration without silently changing previously reviewed homepage details.

## Preview and checks

From the shared repository, run `python3 -m http.server 4173 --bind 127.0.0.1`, then open `http://127.0.0.1:4173/programme.html`. Stop the server after review. This is a local handoff, not a published or protected Preview URL. On the existing Vercel cleanUrls configuration, the intended route is `/programme`.

Browser check: `node tests/programme-browser.cjs`, with Playwright and its Chromium installed in the environment. The check owns an ephemeral loopback server and closes it. In this run Playwright 1.62.1 was already available; Chromium was installed to run scratch using `PLAYWRIGHT_BROWSERS_PATH`. Set `PROGRAMME_EVIDENCE_DIR` to an existing directory to save full-page 1440px and 390px screenshots.

Passed rendered Chromium checks at 1440, 768, 390 and 320px: no horizontal overflow, all images decode and have alt text, one H1 and current navigation item, noindex metadata, keyboard skip-link focus transfer, delivery anchor, all page link HTTP responses and fragment targets, reduced motion, and no browser/HTTP errors. Desktop and mobile screenshots were visually inspected. This is engineering verification, not independent Product/QE approval or a full accessibility audit.

The existing `npm test` is a maintenance-page-only contract and is not the correct programme check. Whole-tree `git diff --check` reports pre-existing trailing whitespace in index.html; the scoped staged diff is checked separately.

## StarLord integration and review

- Link the homepage Programme and Discover programme links to `/programme`; homepage/shared navigation remains parent-owned.
- Replace working homepage anchor destinations with approved sibling routes when all pages are integrated.
- Include the already supplied, currently untracked `assets/breakfast-together.jpg` in the integration commit. It is a dependency, not newly authored by this task. Logo is already tracked.
- Stage Product visual/content review and independent Quality Engineering against the combined protected, noindex Preview. Recheck 320px/mobile, keyboard navigation, image loading and cross-page links after shared integration.
- No push, merge, deployment, indexing change or production maintenance change is included. No runtime service was configured for this issue; the verification server was temporary and stopped.
