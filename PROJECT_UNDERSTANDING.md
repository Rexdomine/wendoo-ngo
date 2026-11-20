# Wendoo project understanding

Updated: 2026-11-20

## Scope

This repository contains the current static, multi-page Wendoo website refresh. Wendoo is a Nigerian NGO working with schools and communities to help children start the school day nourished and ready to learn. The site remains noindex until publication is approved.

## What the repository contains

- A dependency-light static site served directly by Vercel or a local static server.
- Shared navigation and the design system in `homepage.css`, loaded by every main page, with a page-specific stylesheet layered on top. The two legal pages still use the older `styles.css` + `theme.css` stack.
- Scalable green-and-red SVG brand assets in `assets/wendoo-logo.svg` and `assets/wendoo-emblem.svg`, plus programme imagery.
- `vercel.json` for clean URLs, security headers and the current noindex posture.
- Browser checks for the programme, impact and donation routes, plus `tests/validate.mjs` for the dependency-free site contract.

## Routes and file map

- `index.html`: homepage (hero, why breakfast, the 2022 Nkeze Primary School pilot, approach, and partner/donate calls to action).
- `programme.html`, `our-impact.html`, `about.html`, `partner-with-us.html`, `get-involved.html`, `donate.html`, `contact.html`: the principal public-facing routes.
- `privacy-policy.html`, `terms.html`: legal routes.
- `homepage.css` (shared), the page-specific stylesheets, and `styles.css` + `theme.css` (legal pages only).
- `assets/`: refreshed SVG branding and local image assets.

## Runtime and request behavior

Vercel serves the files without a build step, server code, API or database. Client-side JavaScript is limited to two progressive-enhancement scripts: `mobile-menu.js` (every page; turns the `<details>` menu into an accessible full-screen overlay) and `contact-topic.js` (Contact page only; accessible custom topic dropdown). Pages remain usable without them. Clean URLs map route names such as `/donate` and `/programme` to their corresponding HTML files. The browser loads local styles, images and SVG branding. The HTML robots metadata, `robots.txt` and Vercel response headers keep the site out of search results until launch approval.

## What is intentionally not present

There is no live payment flow, contact submission backend, newsletter, analytics, authentication, CMS or public donation destination. Donation pages clearly state that payment links are unavailable and do not collect payment details. The Contact page lists Wendoo's phone numbers, email and Asaba office address, but both the Contact and Get Involved forms stay disabled until an approved submission backend is supplied.

## Local verification

Run `npm test` for the dependency-free homepage contract checks (`tests/validate.mjs` reads `index.html`, `homepage.css` and `vercel.json`). The focused browser checks require Playwright and Chromium. The test servers resolve both extensionless clean routes and explicit `.html` paths, and they retain the root-containment check.

## Verified facts in use

Confirmed by the owner on 2026-11-20: the breakfast pilot launched in 2022 at Nkeze Primary School, Idumuje-Ugboko, Delta State, ran for three school terms, and supported 244 pupils. Keep these consistent across the Home, Programme, Our Impact, About and Donate pages.

## Publication posture

The site is ready for review on the protected Preview branch, not production publication. Before indexing or launch, confirm final content, registration and contact details, donation destination, image consent and safeguarding review.
