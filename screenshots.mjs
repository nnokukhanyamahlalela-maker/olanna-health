import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function tryClick(page, selector, label) {
  const loc = page.locator(selector).first();
  if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
    await loc.click({ force: true });
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

async function clickTab(page, tabLabel) {
  const loc = page.locator(`[aria-label="${tabLabel}"]`).first();
  if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
    await loc.click({ force: true });
    await page.waitForTimeout(2500);
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 60000 });
  console.log('Waiting for splash...');
  await page.waitForTimeout(36000);

  let body = () => page.innerText('body').catch(() => '');
  let text = await body();

  await tryClick(page, 'text=/Continue/i', 'intro');
  await page.waitForTimeout(1500);
  text = await body();
  if (text.includes('call you')) {
    await page.locator('input').first().fill('Amara');
    await page.waitForTimeout(500);
    await tryClick(page, 'text=/Continue/i', 'name');
    await page.waitForTimeout(3000);
  }
  text = await body();
  if (text.includes('Nice to meet')) await page.waitForTimeout(3500);
  text = await body();
  if (text.includes('Tell me about') || text.includes('Enter manually')) {
    await tryClick(page, 'text=/Enter manually/i', 'profile');
    await page.waitForTimeout(1000);
    await tryClick(page, 'text=/Continue/i', 'profile2');
    await page.waitForTimeout(1500);
  }
  text = await body();
  if (text.includes('pleasure') || text.includes('Select all')) {
    await tryClick(page, 'text=/Track my period/i', 'g1');
    await page.waitForTimeout(500);
    await tryClick(page, 'text=/General wellness/i', 'g2');
    await page.waitForTimeout(1000);
    await tryClick(page, 'text=/Continue/i', 'gc');
    await page.waitForTimeout(1500);
  }
  text = await body();
  if (text.includes('Perfect') || text.includes('get started')) await page.waitForTimeout(4000);
  for (let i = 0; i < 5; i++) {
    text = await body();
    if (text.includes('The Lotus Cycle')) break;
    await tryClick(page, 'text=/^Next$/i', 'c') || await tryClick(page, 'text=/Get Started/i', 'gs');
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);
  console.log('Main app loaded!');

  await page.screenshot({ path: `${OUT}/screenshot_cycle.png` });
  console.log('Saved: cycle');

  await page.mouse.move(200, 350);
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(200); }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/screenshot_insights.png` });
  console.log('Saved: insights');

  await clickTab(page, 'Calendar');
  await page.screenshot({ path: `${OUT}/screenshot_calendar.png` });
  console.log('Saved: calendar');

  await clickTab(page, 'Check-in');
  await page.screenshot({ path: `${OUT}/screenshot_checkin.png` });
  console.log('Saved: checkin');

  await clickTab(page, 'Health');
  await page.screenshot({ path: `${OUT}/screenshot_health.png` });
  console.log('Saved: health');

  await clickTab(page, 'Learn');
  await page.screenshot({ path: `${OUT}/screenshot_learn.png` });
  console.log('Saved: learn');

  await browser.close();
  console.log('All done!');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
