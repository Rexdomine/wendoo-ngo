# Wendoo Website Preview

A local preview of the **Wendoo School Breakfast Empowerment Initiative** website.

## Design source

The visual direction was generated with Google Stitch and production-hardened locally using the supplied Wendoo logo. The implementation retains Stitch's editorial spacing, teal/red palette, status treatment and circular community motif while removing unsupported copy, runtime CDN dependencies and unnecessary pointer-tracking JavaScript.

## Run locally

Serve the repository with the included preview server so the clean routes used by the navigation work locally:

```bash
python3 preview_server.py --bind 127.0.0.1
```

Then open `http://127.0.0.1:4174/`. This port is reserved for the Wendoo preview in this workspace. Before sharing it, check the rendered page in the desktop browser for the Wendoo title, logo, and navigation; an HTTP success code alone is insufficient.

## Validation

```bash
npm test
```

## Deployment

This project is configured as a static Vercel deployment. The maintenance page is intentionally marked `noindex, nofollow` until the full Wendoo website is ready.
