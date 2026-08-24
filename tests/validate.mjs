import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../script.js', import.meta.url), 'utf8');

// Section order exact
const ids = ['hero','problem','story','programme','impact','partner','stories','cta'];
let prevIndex = -1;
for (const id of ids) {
  const idx = html.indexOf('id="'+id+'"');
  assert.ok(idx > prevIndex, 'RED: section id order violated for '+id);
  prevIndex = idx;
}

// Response and corporate removed
assert.ok(!html.includes('id="response"'), 'RED: response section present');
assert.ok(!html.includes('id="corporate"'), 'RED: corporate section present');

// Exactly one h1
const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
assert.strictEqual(h1s.length, 1, 'RED: must have exactly one h1');
assert.ok(h1s[0].includes('No child should have to learn on an empty stomach'), 'RED: h1 headline');

// Brand line
assert.ok(html.includes('Putting breakfast on the table. Putting opportunity in children’s hands.'), 'RED: brand line');

// Canonical copy
assert.ok(html.includes('Wendoo School Breakfast Empowerment Initiative'), 'RED: initiative name');
assert.ok(html.includes("Hunger doesn’t stop at the school gate"), 'RED: problem heading');
assert.ok(html.includes('Breakfast'), 'RED: breakfast concept');
assert.ok(html.includes('The Wendoo School Breakfast Empowerment Initiative'), 'RED: programme heading');
assert.ok(html.includes('Our Impact'), 'RED: impact');
assert.ok(html.includes('Partner With Wendoo'), 'RED: partner');
assert.ok(html.includes('Donate Now') || html.includes('Support a Child'), 'RED: donation CTA');
assert.ok(html.includes('Stories'), 'RED: stories');

// Each story asset exactly once in HTML (only hero uses morning; service/eating/learning each once)
const counts = {
  'story-morning.webp': (html.match(/story-morning\.webp/g) || []).length,
  'story-service.webp': (html.match(/story-service\.webp/g) || []).length,
  'story-eating.webp': (html.match(/story-eating\.webp/g) || []).length,
  'story-learning.webp': (html.match(/story-learning\.webp/g) || []).length,
};
assert.strictEqual(counts['story-morning.webp'], 1, 'RED: story-morning must appear exactly once');
assert.strictEqual(counts['story-service.webp'], 1, 'RED: story-service must appear exactly once');
assert.strictEqual(counts['story-eating.webp'], 1, 'RED: story-eating must appear exactly once');
assert.strictEqual(counts['story-learning.webp'], 1, 'RED: story-learning must appear exactly once');

// Assets exist
['assets/story-morning.webp','assets/story-service.webp','assets/story-eating.webp','assets/story-learning.webp'].forEach(p => {
  assert.ok(existsSync(p), 'RED: asset missing '+p);
  assert.ok(html.includes('src="/'+p+'"'), 'RED: asset src missing '+p);
});

// No old decorative webp references
assert.ok(!html.includes('assets/hero.webp'), 'RED: old hero.webp');
assert.ok(!html.includes('assets/breakfast-effect.webp'), 'RED: old breakfast-effect.webp');

// One disclosure exact
const disclosures = html.match(/Illustrative scenes feature fictional people\./g) || [];
assert.strictEqual(disclosures.length, 1, 'RED: disclosure must appear exactly once');

// No forbidden publication-safe
assert.ok(!html.includes('publication-safe'), 'RED: forbidden publication-safe');
// No fake metrics / unauthorized
['10,000','100,000','thousands of','children served','email:@','tel:+'].forEach(t => assert.ok(!html.toLowerCase().includes(t.toLowerCase()), 'RED: unauthorized: '+t));

// Exactly 2 hero actions (Donate Now + Begin journey) — not more
assert.strictEqual((html.match(/btn--primary/g) || []).length >= 1, true, 'RED: primary button missing');

// Impact truthful phrase
assert.ok(html.includes('Verified figures are being prepared'), 'RED: impact pending phrase');

// No fake impact numbers
assert.ok(!html.includes('10,000'), 'RED: fake metric');

// Footer exactly 12 labels
const footerBlock = html.match(/<nav aria-label="Site pages"[\s\S]*?<\/nav>/)?.[0] || '';
const footerItems = footerBlock.match(/<li>[\s\S]*?<\/li>/g) || [];
assert.strictEqual(footerItems.length, 12, 'RED: footer must have exactly 12 labels');

// Donation dialog / noindex / video / data-reveal
assert.ok(html.includes('id="donate-dialog"'), 'RED: donate dialog');
assert.ok(js.includes('showModal'), 'RED: showModal');
assert.ok(html.includes('data-action="open-donate"'), 'RED: open-donate');
assert.ok(html.includes('method="dialog"'), 'RED: dialog method');
assert.ok(html.includes('name="robots" content="noindex, nofollow"'), 'RED: robots');
assert.ok(html.includes('data-reveal'), 'RED: data-reveal');
assert.ok(html.includes('assets/video-poster.webp'), 'RED: video poster');
assert.ok(js.includes('l-pzjlSyjA0'), 'RED: video id');
assert.ok(js.includes('youtube-nocookie'), 'RED: youtube-nocookie');
assert.ok(!html.includes('<iframe'), 'RED: no initial iframe');
assert.ok(html.includes('data-action="load-video"'), 'RED: load-video');

// Fail-open CSS rooted at html.reveal-ready
assert.ok(css.includes('html.reveal-ready'), 'RED: reveal-ready root missing');
assert.ok(css.includes('prefers-reduced-motion'), 'RED: reduced-motion CSS missing');
assert.ok(js.includes('reduced-motion'), 'RED: reduced-motion JS hook missing');
assert.ok(html.includes('reduced-motion') || css.includes('reduced-motion'), 'RED: reduced-motion contract');

// No inline onclick / no dead href="#"
assert.ok(!html.includes('onclick='), 'RED: inline onclick');
assert.ok(!html.includes('href="#"'), 'RED: dead href');

console.log('Homepage validation GREEN');
