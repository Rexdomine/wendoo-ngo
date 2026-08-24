import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../script.js', import.meta.url), 'utf8');
const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));

// Section IDs exact order
const ids = ['hero','problem','response','pillars','breakfast-effect','programme','why','impact','partner','corporate','stories','cta'];
let prevIndex = -1;
for (const id of ids) {
  const idx = html.indexOf('id="'+id+'"');
  assert.ok(idx > prevIndex, 'RED: section id order violated for '+id);
  prevIndex = idx;
}

// Exactly one h1 with exact headline
const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
assert.strictEqual(h1s.length, 1, 'RED: must have exactly one h1');
assert.ok(h1s[0].includes('No child should have to learn on an empty stomach'), 'RED: h1 headline exact match');

// Key canonical copy
assert.ok(html.includes('Wendoo School Breakfast Empowerment Initiative'), 'RED: initiative name');
assert.ok(html.includes('Hunger doesn’t stop at the school gate'), 'RED: problem heading');
assert.ok(html.includes('Four pillars') || html.includes('Nourish'), 'RED: pillars');
assert.ok(html.includes('Breakfast Effect'), 'RED: breakfast-effect');
assert.ok(html.includes('The Wendoo School Breakfast Empowerment Initiative'), 'RED: programme heading');
assert.ok(html.includes('When a child is nourished, they can focus on what matters.'), 'RED: why section canonical heading');
assert.ok(html.includes('Our Impact'), 'RED: impact');
assert.ok(html.includes('Partner With Wendoo'), 'RED: partner');
assert.ok(html.includes('Your CSR can feed more than a report.'), 'RED: corporate section canonical heading');
assert.ok(html.includes('Stories'), 'RED: stories');
assert.ok(html.includes('Donate Now') || html.includes('Support a Child'), 'RED: donation CTA');

// Four pillar names
['Nourish','Enable','Empower','Scale'].forEach(p => assert.ok(html.includes(p), 'RED: pillar '+p));

// Footer IA — exactly 12 labels; only Home is active while later pages are not built.
const footerBlock = html.match(/<nav aria-label="Site pages"[\s\S]*?<\/nav>/)?.[0] || '';
const footerItems = footerBlock.match(/<li>[\s\S]*?<\/li>/g) || [];
assert.strictEqual(footerItems.length, 12, 'RED: footer must have exactly 12 page labels');
const expectedLabels = ['Home','About Us (coming soon)','Our Programme (coming soon)','Our Impact (coming soon)','Partner With Us (coming soon)','Get Involved (coming soon)','Donate (coming soon)','Contact (coming soon)','Privacy Policy (coming soon)','Terms and Conditions (coming soon)','Safeguarding (coming soon)','Complaints (coming soon)'];
expectedLabels.forEach(l => assert.ok(html.includes(l), 'RED: footer label missing: '+l));
assert.ok(!html.includes('href="#"'), 'RED: dead href="#" present');

// No inline onclick
assert.ok(!html.includes('onclick='), 'RED: inline onclick');

// No old maintenance copy
['Website refresh in progress','We\'re refreshing our digital home','A brighter experience','is on the way.','website is currently being','refreshed. Please check back soon.'].forEach(t => assert.ok(!html.includes(t), 'RED: old maintenance copy: '+t));

// No fake metrics / phone / email / location / partner / testimonial
['10,000','100,000','1,000','5,000','50,000','+','thousands of','children served','email:@','tel:+','@wendoo','testimony','testimonial','partner logo'].forEach(t => assert.ok(!html.toLowerCase().includes(t.toLowerCase()), 'RED: unauthorized fake content: '+t));

// Truthful donation dialog
assert.ok(html.includes('id="donate-dialog"'), 'RED: donate dialog missing');
assert.ok(js.includes('showModal'), 'RED: native dialog showModal hook missing');
assert.ok(html.includes('data-action="open-donate"'), 'RED: open-donate hook missing');
assert.ok(html.includes('method="dialog"'), 'RED: form method=dialog missing');

// Conceptual disclosure (generated media decorative alt="" + visible disclosure)
assert.ok(html.includes('alt=""'), 'RED: decorative alt missing');
assert.ok(html.includes('Illustrative visual.'), 'RED: conceptual disclosure missing');

// WebP assets exact dimensions and width/height matching
const assets = {
  'assets/hero.webp': [1400,787],
  'assets/breakfast-effect.webp': [1400,787],
  'assets/video-poster.webp': [1280,720],
};
for (const [p, [w,h]] of Object.entries(assets)) {
  assert.ok(existsSync(p), 'RED: asset missing '+p);
  assert.ok(html.includes('src="/'+p+'"'), 'RED: asset src missing '+p);
  assert.ok(html.includes('width="'+w+'"'), 'RED: asset width mismatch '+p);
  assert.ok(html.includes('height="'+h+'"'), 'RED: asset height mismatch '+p);
}

// Video: ID, youtube-nocookie JS hook, no iframe in initial HTML
assert.ok(js.includes('l-pzjlSyjA0'), 'RED: video ID missing');
assert.ok(js.includes('youtube-nocookie'), 'RED: youtube-nocookie hook missing');
assert.ok(!html.includes('<iframe'), 'RED: iframe must not be in initial HTML');
assert.ok(html.includes('data-action="load-video"'), 'RED: video load hook missing');

// No unauthorized drive child images
assert.ok(!html.includes('drive.google'), 'RED: drive link present');
assert.ok(!html.includes('lh3.google'), 'RED: unauthorized image source');

// Noindex meta
assert.ok(html.includes('name="robots" content="noindex, nofollow"'), 'RED: robots meta');

// CSS contracts
assert.ok(css.includes('prefers-reduced-motion'), 'RED: reduced-motion CSS missing');
assert.ok(css.includes('@media'), 'RED: responsive media missing');
assert.ok(css.includes(':focus'), 'RED: focus styles missing');
assert.ok(css.includes('.dialog-panel:focus-visible'), 'RED: dialog focus-visible missing');
assert.ok(!html.includes(' style='), 'RED: inline style conflicts with self-only CSP');

// CSP in vercel.json — narrow, with script-src 'self' and frame-src youtube-nocookie, no unsafe-inline/wildcards
const cspEntry = vercel.headers?.find(h => h.source === '/(.*)')?.headers?.find(h => h.key === 'Content-Security-Policy');
assert.ok(cspEntry, 'RED: CSP header missing');
const csp = cspEntry.value;
assert.ok(csp.includes("script-src 'self'"), 'RED: CSP script-src must be self');
assert.ok(csp.includes("frame-src https://www.youtube-nocookie.com"), 'RED: CSP frame-src youtube-nocookie missing');
assert.ok(!csp.includes('unsafe-inline'), 'RED: CSP contains unsafe-inline');
assert.ok(!csp.includes('*'), 'RED: CSP contains wildcard');
assert.ok(!csp.includes("script-src 'none'"), 'RED: CSP script-src none breaks JS');
assert.ok(csp.includes("default-src 'self'"), 'RED: CSP default-src');

console.log('Homepage validation GREEN: all sections, copy, assets, CSP, contracts verified.');
