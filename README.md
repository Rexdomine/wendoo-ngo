# Wendoo — School Breakfast Empowerment Initiative (Homepage Preview)

Homepage preview branch `feat/homepage-v1` for the Wendoo School Breakfast Empowerment Initiative.

- **Scope**: Home (`index.html`) only. Later routes (About, Programme details, Impact reporting, Stories, Contact) are not implemented.
- **State**: `noindex, nofollow` via `robots` meta and Vercel `X-Robots-Tag`. No deployment to public index until full site review and consent-led content are confirmed.
- **Conceptual imagery**: `hero.webp` and `breakfast-effect.webp` are AI-generated illustrative visuals, not evidence of real programme outcomes. Both are decorative (`alt=""`) and carry the visible disclosure “Illustrative visual.”
- **Video**: `video-poster.webp` is the static poster from Wendoo NGO’s approved official video, not an AI-generated image. The privacy-enhanced YouTube player loads from `youtube-nocookie.com` only after user activation, with `autoplay=1&mute=1&rel=0`; there is no background audio.
- **Accessibility & contracts**: Semantic HTML (ordered `id` sections, single `h1`, native `<dialog>`, `data-action` hooks, ARIA landmarks), strict CSS (`prefers-reduced-motion`, focus-visible, responsive), CSP (`default-src 'self'; script-src 'self'; frame-src https://www.youtube-nocookie.com`), and accessible progressive JS (addEventListener only, `.js` class, mobile nav with focus restore, donation dialog focus trap and restore, video idempotent).

## Run / test

```bash
# Serve locally
python3 -m http.server 4173

# Validation (semantic, copy, assets, CSP)
npm test

# Playwright QA (requires browser binary — see below)
npm run test:browser
```

## Validation evidence

`npm test` runs `tests/validate.mjs`: section IDs in order, one `h1`, exact copy, four pillars, all 12 locked footer IA labels (Home active; 11 future destinations noninteractive; no dead `href="#"`), truthful donation dialog (`method="dialog"`, `data-action="open-donate"`), decorative `alt=""` + disclosure, exact WebP dimensions (hero/breakfast-effect 1400×787; video-poster 1280×720), video ID and `youtube-nocookie` JS hook, no initial iframe, `noindex` meta, CSS contracts, and narrow CSP.

## Browser harness

`tests/browser-qa.mjs` uses installed Playwright (`node_modules/playwright`). It starts a bounded `python3 -m http.server` child on a unique port, tests viewports 390×844 / 768×1024 / 1366×768 / 1440×900, and asserts 200, one `h1`, no overflow, decoded local images, no console errors, mobile nav behavior (open/close/Escape/focus restore) at mobile/tablet, desktop nav visible / toggle hidden, donation open/close via button/Escape with exact-opener focus restore, no initial iframe then click creates the expected `youtube-nocookie` iframe (the external request is intercepted to avoid provider/network noise), computed contrast for editorial surfaces, and reduced-motion behavior.

If Chromium executable is missing, harness prints:
```
BROWSER EXECUTABLE MISSING
Playwright Chromium binary not found. Install with: npx playwright install chromium
```
and exits non-zero without attempting installation.

## No secrets / raw sources

No `.env` values, private paths, raw Stitch source files, or external account details appear in this branch. Assets, `index.html`, `styles.css`, and approved logo (`assets/wendoo-logo.jpg`) are preserved; only `script.js`, `tests/`, `package.json`, `vercel.json`, and `README.md` have been finalized per the homepage close-out directive.
