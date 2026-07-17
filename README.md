# Wendoo NGO Maintenance Page

A lightweight, responsive maintenance page for **Wendoo School Breakfast Empowerment Initiative**.

## Design source

The visual direction was generated with Google Stitch and production-hardened locally using the supplied Wendoo logo. The implementation retains Stitch's editorial spacing, teal/red palette, status treatment and circular community motif while removing unsupported copy, runtime CDN dependencies and unnecessary pointer-tracking JavaScript.

## Run locally

Serve the repository with any static file server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Validation

```bash
npm test
```

## Deployment

This project is configured as a static Vercel deployment. The maintenance page is intentionally marked `noindex, nofollow` until the full Wendoo website is ready.
