// Focused rendered check. Requires Playwright in the verification environment.
// The loopback server exists only for this test and is always closed afterwards.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const config = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep)) throw Error('Invalid path');
      const bytes = await fs.readFile(file);
      const mime = {'.html':'text/html', '.css':'text/css', '.jpg':'image/jpeg'}[path.extname(file)] || 'application/octet-stream';
      for (const header of config.headers[0].headers) res.setHeader(header.key, header.value);
      res.setHeader('Content-Type', mime); res.end(bytes);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless: true});
    const page = await browser.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if(response.status() >= 400) failures.push(response.url()); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const artifacts = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
    if(artifacts) await fs.mkdir(artifacts, {recursive:true});
    for (const width of [1440,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      await page.goto(origin + '/donate.html');
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
      assert.equal(await page.locator('[aria-current="page"]').innerText(),'Donate');
      assert.equal(await page.locator('.currency-card').count(),3);
      assert.equal(await page.locator('.currency-card a, .currency-card button, input, form, script').count(),0);
      assert.equal(await page.locator('.currency-status').allTextContents().then(x=>x.every(t=>t==='Donation link coming soon')),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true,`overflow at ${width}`);
      assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(img=>img.complete && img.naturalWidth>0)),true);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').textContent(),'Skip to content');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator(':focus').getAttribute('id'),'main');
      const summary = page.locator('summary').first();
      await summary.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('details').first().getAttribute('open'),'');
      await page.keyboard.press('Enter');
      await page.locator('h1').click();
      if(artifacts) await page.screenshot({path:path.join(artifacts,`donate-${width}.png`),fullPage:true});
      console.log(`PASS rendered ${width}px: layout, image, semantics, unavailable payment state, skip link, keyboard FAQ`);
    }
    const links = await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
    for(const href of new Set(links)) {
      const url = new URL(href, origin + '/donate.html');
      assert.equal(url.origin,origin,'Unexpected external link');
      const response = await page.request.get(url.href);
      assert.equal(response.status(),200,href);
      if(url.hash) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`),`Missing anchor ${href}`);
    }
    assert.deepEqual(failures,[]);
    console.log('PASS all local destinations/anchors; no failed responses or browser errors');
  } finally {if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
