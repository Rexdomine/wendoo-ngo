import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';
import assert from 'node:assert/strict';

const PORT = 9876 + Math.floor(Math.random() * 900);
const BASE = `http://127.0.0.1:${PORT}`;
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];
const storyAssets = ['story-morning.webp', 'story-service.webp', 'story-eating.webp', 'story-learning.webp'];
const majorSections = ['hero', 'problem', 'story', 'programme', 'impact', 'partner', 'stories', 'cta'];

let server;
let browser;

function channel(value) {
  const match = String(value).match(/[\d.]+/g);
  return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
}

function luminance(rgb) {
  const values = rgb.map(value => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(channel(foreground)), luminance(channel(background)));
  const darker = Math.min(luminance(channel(foreground)), luminance(channel(background)));
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: '.', stdio: 'pipe' });
  await delay(800);
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const applicationErrors = [];
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().toLowerCase().includes('youtube')) applicationErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', error => applicationErrors.push(`page: ${error.message}`));

    const response = await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 15000 });
    assert.equal(response.status(), 200, `HTTP status at ${viewport.name}`);
    assert.equal(await page.locator('h1').count(), 1, `one h1 at ${viewport.name}`);
    assert.ok((await page.locator('h1').textContent()).includes('No child should have to learn'), `mission h1 at ${viewport.name}`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 2, `horizontal overflow at ${viewport.name}: ${overflow}px`);

    const images = page.locator('img');
    for (let index = 0; index < await images.count(); index += 1) await images.nth(index).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Array.from(document.images).every(image => image.complete), null, { timeout: 7000 });
    const broken = await page.evaluate(() => Array.from(document.images).filter(image => image.naturalWidth === 0).map(image => image.getAttribute('src')));
    assert.deepEqual(broken, [], `broken images at ${viewport.name}`);

    for (const asset of storyAssets) {
      assert.equal(await page.locator(`img[src="/assets/${asset}"]`).count(), 1, `${asset} appears once at ${viewport.name}`);
    }
    for (const id of majorSections) {
      const box = await page.locator(`#${id}`).boundingBox();
      assert.ok(box && box.width > 20 && box.height > 20, `${id} has geometry at ${viewport.name}`);
    }

    await page.locator('#problem').evaluate(element => {
      document.documentElement.style.scrollBehavior = 'auto';
      element.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    await page.waitForTimeout(50);
    const anchorGeometry = await page.evaluate(() => ({
      top: document.getElementById('problem').getBoundingClientRect().top,
      header: document.querySelector('.site-header').getBoundingClientRect().height,
    }));
    assert.ok(anchorGeometry.top >= anchorGeometry.header - 3, `sticky header does not cover #problem at ${viewport.name}: top=${anchorGeometry.top}, header=${anchorGeometry.header}`);

    const primaryButton = await page.locator('.btn--primary').first().evaluate(element => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor };
    });
    assert.ok(contrast(primaryButton.color, primaryButton.background) >= 4.5, `primary CTA contrast at ${viewport.name}`);
    const impactHeading = await page.locator('.impact-head h2').evaluate(element => {
      const text = getComputedStyle(element).color;
      const background = getComputedStyle(element.parentElement).backgroundColor;
      return { text, background };
    });
    assert.ok(contrast(impactHeading.text, impactHeading.background) >= 4.5, `impact heading contrast at ${viewport.name}`);

    const isCompact = viewport.width <= 768;
    const toggleHidden = await page.locator('.nav-toggle').evaluate(element => element.offsetParent === null);
    if (isCompact) {
      assert.equal(toggleHidden, false, `navigation toggle visible at ${viewport.name}`);
      await page.click('.nav-toggle');
      await page.waitForSelector('#primary-nav.open');
      await page.keyboard.press('Escape');
      await page.waitForSelector('#primary-nav.open', { state: 'hidden' });
    } else {
      assert.equal(toggleHidden, true, `navigation toggle hidden at ${viewport.name}`);
      assert.equal(await page.locator('.primary-nav').evaluate(element => getComputedStyle(element).display !== 'none'), true, `desktop nav visible at ${viewport.name}`);
    }

    const donate = page.locator('[data-action="open-donate"]').first();
    await donate.click();
    await page.waitForSelector('#donate-dialog[open]');
    assert.ok(await page.locator('#donate-dialog').evaluate(dialog => dialog.contains(document.activeElement)), `dialog receives focus at ${viewport.name}`);
    await page.keyboard.press('Escape');
    await page.waitForSelector('#donate-dialog', { state: 'hidden' });
    assert.equal(await donate.evaluate(element => element === document.activeElement), true, `dialog restores focus at ${viewport.name}`);

    assert.equal(await page.locator('#video-frame iframe').count(), 0, `poster-first video at ${viewport.name}`);
    await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
    await page.click('[data-action="load-video"]');
    await page.waitForSelector('#video-frame iframe');
    const videoSource = await page.locator('#video-frame iframe').getAttribute('src');
    assert.ok(videoSource.includes('youtube-nocookie.com/embed/l-pzjlSyjA0'), `privacy video source at ${viewport.name}`);
    assert.ok(videoSource.includes('autoplay=1') && videoSource.includes('mute=1'), `muted click-to-play params at ${viewport.name}`);

    assert.deepEqual(applicationErrors, [], `application errors at ${viewport.name}: ${applicationErrors.join(' | ')}`);
    await context.close();
  }

  const reducedContext = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  assert.equal(await reducedPage.locator('html').evaluate(element => element.classList.contains('reduced-motion')), true, 'real reduced-motion preference is detected');
  const reducedStyles = await reducedPage.locator('[data-reveal]').evaluateAll(elements => elements.map(element => ({ opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform })));
  assert.ok(reducedStyles.every(style => style.opacity === '1' && style.transform === 'none'), 'reduced motion disables reveal displacement');
  await reducedContext.close();

  const noScriptContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  const noScriptStyles = await noScriptPage.locator('[data-reveal]').evaluateAll(elements => elements.map(element => ({ opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform, display: getComputedStyle(element).display })));
  assert.ok(noScriptStyles.length > 0, 'no-JS reveal elements present');
  assert.ok(noScriptStyles.every(style => style.opacity === '1' && style.transform === 'none' && style.display !== 'none'), 'no-JS content is fully visible');
  await noScriptContext.close();

  console.log('Browser QA GREEN');
}

run()
  .catch(error => { console.error('QA ERROR:', error.message || error); process.exitCode = 1; })
  .finally(async () => {
    if (browser) await browser.close().catch(() => {});
    if (server) server.kill();
  });
