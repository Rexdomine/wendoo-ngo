# Contact page handoff — REX-99

Contact page implementation; usable enquiry path is still intentionally unavailable.

## Files and integration

- `contact.html`: semantic, noindex Contact page with truthful unavailable state.
- `contact.css`: scoped layout and keyboard focus styles, loading shared `styles.css` first.
- Route: `/contact.html` on a plain static server; Vercel clean URLs also supports `/contact`.
- All page headers now include the `/contact` route, and homepage contact CTAs remain anchored to the homepage contact section until a verified enquiry destination is approved.
- The refreshed site uses the shared bone, green, teal and red palette from `theme.css`.

## Evidence and blocker

Repository has no submission backend. `vercel.json` has `form-action 'none'` and `script-src 'none'`. No public email, phone, address or organisation-controlled enquiry URL is available in assigned evidence. The handoff owner's administrative email is not a verified Wendoo public contact route and was not reused.

StarLord must obtain and record one approved organisation-controlled enquiry route and its source on the project task. A functioning form instead requires a separately approved backend/delivery/data-handling scope and Architecture review. Do not loosen CSP or provision providers as part of this shell.

## Verification and preview reproduction

Focused Node source checks passed: exactly one H1, noindex, no form/input/script or fabricated mailto/tel links, all referenced local assets and homepage anchors exist. These are source checks, not rendered-browser evidence. `git diff --check` reported pre-existing trailing whitespace in index.html line 29; that concurrent edit was preserved.

For local reviewer reproduction, serve the repository using `python3 -m http.server 4173 --bind 127.0.0.1` and open `http://127.0.0.1:4173/contact.html`. Agent-operated preview sessions must use Paperclip managed runtime controls. No live service or deployment was started here.

StarLord should stage Product (Vision) and independent QE (NightWing) on the combined protected Preview. Check 320/375/768/1440px widths, 200% zoom, keyboard skip link/focus, logo loading, navigation destinations, and availability copy. Once a route is supplied, verify that action reaches its intended destination; do not send a live enquiry without explicit permission. No rendered-browser or independent approval is claimed. No push, merge, deployment, production change or header change occurred.
