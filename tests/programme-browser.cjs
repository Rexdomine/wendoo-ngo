// Run with Playwright installed and Chromium available. No persistent server is started.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer(async (req, res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const data = await fs.readFile(file);
      const types = { '.html': 'text/html', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/programme.html');
      await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('nav [aria-current="page"]').count(), 1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
      assert(await page.locator('img').evaluateAll(images => images.every(img => img.naturalWidth && img.alt.trim())), 'Image load/alt');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
      await page.locator('a[href="#delivery"]').click();
      await page.waitForFunction(() => location.hash === '#delivery');
      if (process.env.PROGRAMME_EVIDENCE_DIR && [1440, 390].includes(width)) {
        await page.goto(base + '/programme.html');
        await page.screenshot({ path: path.join(process.env.PROGRAMME_EVIDENCE_DIR, `programme-${width}.png`), fullPage: true });
      }
      console.log(`PASS ${width}px: no overflow, images, landmarks, current page, noindex, keyboard skip and delivery link`);
    }
    const links = await page.locator('a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    for (const href of new Set(links)) {
      const url = new URL(href, base + '/programme.html');
      const response = await page.request.get(url.href);
      assert.equal(response.status(), 200, href);
      if (url.hash) assert((await response.text()).includes(`id="${url.hash.slice(1)}"`), `Missing target ${href}`);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.deepEqual(errors, []);
    console.log('PASS all page destinations and fragment targets, reduced motion, no browser or HTTP errors');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
