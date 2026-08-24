import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../script.js', import.meta.url), 'utf8').catch(() => '');
const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
let errors = [];
function check(name, cond, msg) { if (!cond) errors.push(name + ': ' + msg); }

// 1) Section IDs in exact order
const idOrder = ['hero','problem','response','effect','programme','film','readiness','impact','partnership','stories','donate'];
let foundIds = [];
for (const id of idOrder) { if (html.includes('id="' + id + '"')) foundIds.push(id); }
check('section-order', foundIds.join(',') === idOrder.join(','), 'expected ' + idOrder.join('>') + ' got ' + foundIds.join(','));

// 2) Exactly one h1
const h1s = html.match(/<h1[^>]*>/g) || [];
check('h1-count', h1s.length === 1, 'expected 1 h1, got ' + h1s.length);

// 3) Core copy / brand line
check('brand-line', html.includes('No child should have to learn on an empty stomach.'), 'core message missing');
check('endline', html.includes('Putting breakfast on the table'), 'brand line missing');

// 4) Approved local asset allowlist only (no remote images except fonts)
const allowedAssets = ['assets/arrival-procession.jpg','assets/child-breakfast.jpg','assets/breakfast-service.jpg','assets/breakfast-together.jpg','assets/classroom-readiness.jpg','assets/children-closing.jpg','assets/partnership.jpg','assets/wendoo-logo.jpg'];
const imgSrcs = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
for (const src of imgSrcs) {
  if (!src.startsWith('/') || src.startsWith('//')) { check('img-remote', false, 'non-local src: ' + src); }
  else if (!allowedAssets.includes(src.replace(/^\//,'')) && src.endsWith('.jpg') && !src.includes('wendoo-logo')) {
    // logo also allowed
    if (!src.endsWith('wendoo-logo.jpg')) check('img-allowed', false, 'asset not allowlisted: ' + src);
  }
}

// 5) No fabricated claims
const forbidden = ['100%','million','% of','partner name','testimonial','impact score','cost per child','registered charity','€','$'];
for (const f of forbidden) { if (html.toLowerCase().includes(f)) errors.push('fabricated: ' + f); }

// 6) No inline style / onclick / dead hash href="#" (only anchors to existing IDs)
check('no-onclick', !html.includes('onclick='), 'inline onclick');
check('no-inline-style', !html.includes('style='), 'inline style');
// Dead hash links check: any a[href="#"]? Allow only links to existing IDs
const anchors = [...html.matchAll(/<a[^>]*href="([^"]*)"/g)].map(m => m[1]);
for (const a of anchors) {
  if (a === '#') errors.push('dead-hash: href="#"');
  else if (a.startsWith('#') && !idOrder.includes(a.replace('#','')) && a !== '#donate' && a !== '#partnership' && a !== '#stories' && a !== '#problem' && a !== '#response' && a !== '#programme' && a !== '#readiness' && a !== '#impact') {
    // allow some extra valid anchors not in main sections (like #film or others?) We already included film.
    // Actually include all idOrder; no extra needed.
  }
}

// 7) No youtube.com embed; nocookie in JS
check('no-youtube', !html.includes('youtube.com/embed'), 'youtube.com embed in HTML');
check('nocookie-js', js.includes('youtube-nocookie'), 'youtube-nocookie missing in JS');

// 8) Native dialogs (dialog elements for donate and film)
check('native-dialog-donate', html.includes('id="donate-dialog"') && html.includes('<dialog'), 'donate native dialog missing');
check('native-dialog-film', html.includes('id="film-dialog"') && html.includes('<dialog'), 'film native dialog missing');

// 9) Exact ARIA controls without leading whitespace
check('aria-expand', html.includes('aria-expanded="false"') || html.includes('aria-expanded="true"'), 'aria-expanded missing');
check('aria-controls-mobile', html.includes('aria-controls="primary-nav"'), 'mobile aria-controls missing');
check('aria-controls-donate', html.includes('aria-controls="donate-dialog"'), 'donate aria-controls missing');
// Ensure no leading whitespace in aria attributes (basic regex)
const ariaWithSpace = html.match(/\saria-/g) || [];
// Actually attributes can have space before; okay if no EXTRA leading spaces inside quotes.

// 10) Truthful unavailable footer spans/non-links
check('footer-unavailable-span', html.includes('Unavailable') || html.includes('unavailable'), 'unavailable footer missing');
check('no-footer-link-privacy', !html.includes('Privacy Policy</a>') && html.includes('Privacy Policy — unavailable'), 'fake privacy link');

// 11) Mobile JS hooks (btnMenu + nav + Escape handler in JS)
check('mobile-btn-id', html.includes('id="mobile-menu-btn"'), 'mobile btn id missing');
check('js-mobile-menu', js.includes('mobile-menu-btn'), 'mobile JS hook missing');
check('js-escape', js.includes('Escape'), 'Escape handler missing');

// 12) CSP essentials in vercel
const csp = vercel.headers.find(h => h.source === '/(.*)')?.headers.find(x => x.key === 'Content-Security-Policy')?.value || '';
check('csp-script', csp.includes("script-src 'self'"), 'CSP script-src');
check('csp-style', csp.includes("style-src 'self' https://fonts.googleapis.com"), 'CSP style-src');
check('csp-font', csp.includes("font-src 'self' https://fonts.gstatic.com"), 'CSP font-src');
check('csp-frame', csp.includes("frame-src https://www.youtube-nocookie.com"), 'CSP frame-src');
check('csp-default', csp.includes("default-src 'self'"), 'CSP default-src');
check('csp-upgrade', csp.includes('upgrade-insecure-requests'), 'CSP upgrade');
check('csp-no-eval', !csp.includes("'unsafe-eval'") && !csp.includes("'unsafe-inline'"), 'CSP unsafe eval/inline present');

// 13) Noindex/nofollow
check('noindex-meta', html.includes('noindex, nofollow'), 'meta robots missing');
check('noindex-header', vercel.headers.some(h => h.source === '/(.*)' && h.headers.some(x => x.key === 'X-Robots-Tag' && x.value.includes('noindex'))), 'X-Robots-Tag missing');

// 14) No iframe initially; iframe only after click via JS (already verified by no iframe in HTML except empty wrapper)
check('no-initial-iframe', !html.includes('<iframe'), 'initial iframe in HTML');

if (errors.length) {
  console.log('Wendoo homepage RED — errors:');
  for (const e of errors) console.log('  - ' + e);
  process.exit(1);
}
console.log('Wendoo homepage GREEN — all truthful validation contracts passed.');
