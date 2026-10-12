// Local browser rendering with intercepted static files; no deployed preview is implied.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('http://wendoo.test/**', async route => {
      const u = new URL(route.request().url());
      let file = u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname.slice(1));
      if (!path.extname(file)) file += '.html';
      const types = {'.html':'text/html', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png'};
      try { await route.fulfill({body:await fs.readFile(path.join(root, file)),contentType:types[path.extname(file)] || 'application/octet-stream'}); }
      catch { errors.push(`Missing asset: ${file}`); await route.fulfill({status:404}); }
    });
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({width, height:900});
      await page.goto('http://wendoo.test/our-impact');
      for (const img of await page.locator('img').all()) await img.scrollIntoViewIfNeeded();
      await page.evaluate(() => Promise.all([...document.images].map(i=>i.decode())));
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.locator('main').count(),1);
      assert.equal(await page.locator('nav [aria-current="page"]').count(),1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
      assert.ok(await page.evaluate(()=>[...document.images].every(i=>i.naturalWidth>0 && i.alt.length>0)));
      await page.evaluate(()=>scrollTo(0,0));
      await page.keyboard.press('Tab');
      await page.locator('.skip-link').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
      await page.locator('a[href="#programme-experience"]').click();
      assert.ok(await page.locator('#programme-experience').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('header').getBoundingClientRect().bottom),'Anchor hidden by header');
      if (process.env.PAPERCLIP_RUN_SCRATCH_DIR && [390,1440].includes(width)) {
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:path.join(process.env.PAPERCLIP_RUN_SCRATCH_DIR,`impact-${width}.png`),fullPage:true});
      }
      console.log(`PASS ${width}px: render, images, no overflow, landmarks, current navigation, noindex, keyboard skip and anchor`);
    }
    const links = await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
    for (const href of new Set(links)) {
      const u=new URL(href,'http://wendoo.test/our-impact');
      await page.goto(u.href);
      if(u.hash) assert.equal(await page.locator(u.hash).count(),1,`Missing target ${href}`);
      assert.equal(await page.locator('main').count(),1,`Broken page ${href}`);
    }
    assert.deepEqual(errors,[]);
    console.log('PASS all page links resolve and no browser/asset errors');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
