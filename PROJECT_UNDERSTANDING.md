# Wendoo project understanding

Updated: 2026-10-12

## Scope

This repository contains the current static, multi-page Wendoo website refresh. Wendoo is a Nigerian NGO working with schools and communities to help children start the school day nourished and ready to learn. The site remains noindex until publication is approved.

## What the repository contains

- A dependency-light static site served directly by Vercel or a local static server.
- Shared navigation and design tokens in `theme.css`, with page-specific CSS for the homepage, programme, impact, about, partnership, participation, donation, contact and legal routes.
- Scalable green-and-red SVG brand assets in `assets/wendoo-logo.svg` and `assets/wendoo-emblem.svg`, plus programme imagery.
- `vercel.json` for clean URLs, security headers and the current noindex posture.
- Browser checks for the programme, impact and donation routes, plus `tests/validate.mjs` for the dependency-free site contract.

## Routes and file map

- `index.html`: homepage with the programme, impact, partnership and contact sections.
- `programme.html`, `our-impact.html`, `about.html`, `partner-with-us.html`, `get-involved.html`, `donate.html`, `contact.html`: the principal public-facing routes.
- `privacy-policy.html`, `terms.html`: legal routes.
- `styles.css`, `homepage.css`, `theme.css`, and the page-specific stylesheets: shared and scoped presentation.
- `assets/`: refreshed SVG branding and local image assets.

## Runtime and request behavior

Vercel serves the files without a build step, server code, API, database or client-side JavaScript. Clean URLs map route names such as `/donate` and `/programme` to their corresponding HTML files. The browser loads local styles, images and SVG branding. The HTML robots metadata, `robots.txt` and Vercel response headers keep the site out of search results until launch approval.

## What is intentionally not present

There is no live payment flow, contact submission backend, newsletter, analytics, authentication, CMS or public donation destination. Donation pages clearly state that payment links are unavailable and do not collect payment details. Contact details and submission routes remain unavailable until verified organisational information and an approved backend are supplied.

## Local verification

Run `npm test` for the dependency-free contract checks. The focused browser checks require Playwright and Chromium. The test servers resolve both extensionless clean routes and explicit `.html` paths, and they retain the root-containment check.

## Publication posture

The site is ready for review on the protected Preview branch, not production publication. Before indexing or launch, confirm final content, registration and contact details, donation destination, image consent and safeguarding review.
