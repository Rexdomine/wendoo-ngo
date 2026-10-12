import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));

const requiredCopy = [
  'Wendoo School Breakfast Empowerment Initiative',
  'Every child deserves a better start.',
  'No child should have to learn on an empty stomach.',
  'Feed a child. Fuel their future.',
  'Partner With Wendoo',
];
for (const text of requiredCopy) {
  assert.ok(html.includes(text), `Missing required copy: ${text}`);
}

const forbiddenCopy = [
  'website refresh in progress',
  'we’re refreshing our digital home',
  'a brighter experience is on the way',
  'website is currently being refreshed',
];
for (const text of forbiddenCopy) {
  assert.ok(!html.toLowerCase().includes(text), `Unsupported copy found: ${text}`);
}

assert.match(html, /<html lang="en">/);
assert.match(html, /<main id="main">/);
assert.match(html, /<h1>/);
assert.match(html, /alt="Wendoo School Breakfast Empowerment Initiative"/);
assert.match(html, /name="robots" content="noindex, nofollow"/);
assert.match(css, /@media\(max-width:900px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.ok(vercel.headers.some((entry) => entry.source === '/(.*)'), 'Security headers missing');

console.log('Wendoo multipage site validation passed.');
