// Focused browser check for the Donate page against the repository's Preview headers.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { chromium } = (() => { try { return require('playwright'); } catch { return require('playwright-core'); } })();
const root = path.resolve(__dirname, '..');

(async () => {
  const config = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      let rel = pathname === '/' ? '/index.html' : pathname;
      if (!path.extname(rel)) rel += '.html';
      const file = path.resolve(root, '.' + rel);
      if (!file.startsWith(root + path.sep)) throw Error('Invalid path');
      const bytes = await fs.readFile(file);
      const mime = { '.html': 'text/html', '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.js': 'text/javascript' }[path.extname(file)] || 'application/octet-stream';
      for (const header of config.headers[0].headers) res.setHeader(header.key, header.value);
      res.setHeader('Content-Type', mime);
      res.end(bytes);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

  let browser;
  try {
    const chrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
    const page = await browser.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const artifacts = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
    if (artifacts) await fs.mkdir(artifacts, { recursive: true });

    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(origin + '/donate.html', { waitUntil: 'load' });
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      assert.equal(await page.locator('.desktop-nav .nav-donate').getAttribute('aria-current'), 'page');
      assert.deepEqual(await page.locator('.currency-card').evaluateAll(cards => cards.map(card => card.dataset.currency)), ['NGN', 'GBP', 'USD']);
      assert.equal(await page.locator('.currency-card a, .currency-card button, input, form').count(), 0);
      assert.match(await page.locator('.giving-status').innerText(), /Online donations are not available yet/);
      assert.match(await page.locator('.giving-status').innerText(), /No payments or payment details are collected/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}px`);
      if (width <= 768) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        assert.equal(await page.getByRole('dialog', { name: 'Site navigation' }).isVisible(), true);
        await page.keyboard.press('Escape');
      }
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `donate-${width}.png`), fullPage: true });
      console.log(`PASS Donate at ${width}px: images, currencies, unavailable payment state, menu and layout`);
    }

    const links = await page.locator('a').evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute('href')));
    for (const href of new Set(links)) {
      const url = new URL(href, origin + '/donate.html');
      assert.equal(url.origin, origin, 'Unexpected external link');
      const response = await page.request.get(url.href);
      assert.equal(response.status(), 200, href);
      if (url.hash) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`), `Missing anchor ${href}`);
    }
    assert.deepEqual(failures, []);
    console.log('PASS Donate links and browser requests');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
