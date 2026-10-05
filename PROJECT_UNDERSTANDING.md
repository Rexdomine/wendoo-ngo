# Wendoo project understanding

Updated: 2026-10-05

## Scope

This repository is the current Wendoo website handoff. The Google Drive handoff folder is **Wendoo Project Handoff** (`1Lf2viBeb676YwsyepY5REwejeWyxspGD`), owned by Princewill Ejiogu (`rextechng@gmail.com`). The folder is editable by the connected Drive account and is not trashed.

The attached Paperclip screenshot confirms that the Zapier credential is shared with any human in the company and any agent. It shows 17 available actions. The earlier remote-fetch error was therefore not caused by the user's sharing settings; it was a transient/action-route failure. The Google Drive route is now verified and working through the shared Zapier connection.

## Verified Drive inventory

The handoff folder contains 19 files:

- Six JPEG media files: `arrival-procession.jpg`, `breakfast-service.jpg`, `breakfast-together.jpg`, `child-breakfast.jpg`, `children-closing.jpg`, `classroom-readiness.jpg`.
- `partnership.jpg` and `wendoo-logo.jpg`.
- Source files: `index.html`, `styles.css`, `script.js`, `robots.txt`, `vercel.json`, `package.json`, `validate.mjs`, `website-README.md`.
- `HANDOFF.md` and `Wendoo-Project-Handoff.zip.txt`.

The Drive handoff describes the source as a static Vercel site in GitHub repository `Rexdomine/wendoo-ngo`, with the review URL `https://wendoo-ngo.vercel.app`. It identifies branch `feat/homepage-approved`, packaging commit `add916b`, and says the work is not yet the complete 12-page production website.

## UI foundation available

Yes, the project has UI resources for the Wendoo website. The Drive handoff contains the homepage visual direction, the Wendoo logo, brand imagery, source styling, page structure, responsive behavior, and the related homepage copy. The available visual assets are the logo, `partnership.jpg`, and six program photographs covering arrival, breakfast service, children, and classroom readiness.

The local checkout contains the maintenance-page UI implementation (`index.html` and `styles.css`) and the logo. The broader homepage UI is represented by the Drive handoff source and is a different revision from the local maintenance page. I did not identify a separate Figma/design-system file in the verified 19-file inventory. Therefore, the Drive homepage source is the current UI foundation, but it should be treated as a design/content reference until the owner confirms whether we are building that homepage first or the complete 12-page website.

## What the repository is

- A small, dependency-free static site.
- Package name: `wendoo-ngo-maintenance`, version `1.0.0`.
- Purpose: temporary maintenance page for the Wendoo School Breakfast Empowerment Initiative.
- Hosting: Vercel static deployment (`vercel.json`).
- Search visibility: deliberately disabled with HTML `noindex, nofollow` and an `X-Robots-Tag` response header until the full site is ready.

## File map

- `index.html`: the complete page structure, approved maintenance copy, semantic landmarks, logo reference, and document metadata.
- `styles.css`: all visual design and responsive behavior. It uses local CSS only: teal/red brand colors, editorial typography, background gradients, and a CSS-built community mark.
- `assets/wendoo-logo.jpg`: the only shipped visual asset; it is used as the logo and favicon.
- `vercel.json`: static Vercel behavior, clean URLs, and security headers. The Drive copy allows same-origin scripts, supports the privacy-enhanced YouTube frame, and disables indexing; the local maintenance copy is more restrictive and disables scripts.
- `robots.txt`: site-wide crawler disallow rule, matching the temporary maintenance posture.
- `tests/validate.mjs`: dependency-free contract checks for copy, forbidden claims, semantics, accessibility, responsive CSS, reduced motion, and security-header configuration.
- `package.json`: project metadata and the single `npm test` command; there are no runtime or development dependencies.
- `README.md`: local serving, validation, design-source, and deployment notes.

## Runtime and request behavior

1. Vercel serves the repository as static files; there is no build step, server code, API, database, or client-side JavaScript.
2. The browser loads `index.html`, `styles.css`, and the local JPEG logo only.
3. CSP allows same-origin images/styles but sets `script-src 'none'`, blocks forms, frames, objects, and external connections.
4. Crawlers are blocked by both `robots.txt`, the HTML robots meta tag, and the Vercel `X-Robots-Tag` header.

## What is not present

There are no separate program detail pages, working donation or payment flow, contact form, newsletter signup, CMS, analytics, tracking, authentication, or content model. The Drive homepage is a continuous review mockup with unavailable donation, legal, registration, and social destinations. Any future full-site build will need approved content, brand assets, navigation, accessibility review, privacy/analytics decisions, and an explicit launch/indexing decision.

## User experience

The page presents Wendoo's logo, a refresh-status pill, the message “A brighter experience is on the way,” a short check-back message, and a circular community motif built in CSS. It is responsive at 52rem and 32rem breakpoints, uses the supplied JPEG logo, and includes reduced-motion handling for the two decorative animations.

## Technical constraints and decisions

- No runtime JavaScript, external fonts, CDN assets, or third-party requests.
- Copy is intentionally limited to approved maintenance-page messaging; validation rejects donation, newsletter, and unsupported impact claims.
- The page uses semantic `header`, `main`, and `footer` landmarks and descriptive image alt text.
- Security headers are configured in `vercel.json`: MIME sniffing protection, strict referrer policy, restrictive permissions policy, frame denial, CSP, and no indexing.
- `script-src 'none'` means future interactivity must not be added without revisiting the CSP.

## Local verification

Run `npm test`. The existing validator checks required copy, forbidden copy, semantics, accessibility attributes, responsive CSS, reduced-motion CSS, and Vercel security headers.

## Likely next work

1. Compare the Drive homepage handoff with the local maintenance repository; they are materially different revisions.
2. Confirm whether the intended next milestone is the approved continuous homepage mockup or the full 12-page site.
3. Resolve approved content, registration details, donation destination, legal copy, child-media consent, and safeguarding review.
4. Verify GitHub and Vercel ownership before any deployment.
5. Preserve the current no-index posture until the owner approves publication and indexing.

## Current risks / open questions

- The Drive homepage mockup and the local maintenance repository are not the same revision; their CSP, assets, JavaScript, and page scope differ.
- The project is still not publication-ready: donation, legal, registration, contact, social, and safeguarding details are placeholders or unavailable.
- Before production expansion, confirm approved brand assets, final copy, accessibility expectations, ownership of content updates, and launch/indexing approval.
