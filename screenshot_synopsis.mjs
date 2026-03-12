import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function tryClick(page, selector) {
  const loc = page.locator(selector).first();
  if (await loc.count() > 0 && await loc.isVisible().catch(() => false)) {
    await loc.click({ force: true });
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 60000 });
  await page.waitForTimeout(36000);

  let body = () => page.innerText('body').catch(() => '');
  let text;

  await tryClick(page, 'text=/Continue/i');
  await page.waitForTimeout(1500);
  text = await body();
  if (text.includes('call you')) {
    await page.locator('input').first().fill('Amara');
    await page.waitForTimeout(500);
    await tryClick(page, 'text=/Continue/i');
    await page.waitForTimeout(3000);
  }
  text = await body();
  if (text.includes('Nice to meet')) await page.waitForTimeout(3500);
  text = await body();
  if (text.includes('Tell me about') || text.includes('Enter manually')) {
    await tryClick(page, 'text=/Enter manually/i');
    await page.waitForTimeout(1000);
    await tryClick(page, 'text=/Continue/i');
    await page.waitForTimeout(1500);
  }
  text = await body();
  if (text.includes('pleasure') || text.includes('Select all')) {
    await tryClick(page, 'text=/Track my period/i');
    await page.waitForTimeout(500);
    await tryClick(page, 'text=/General wellness/i');
    await page.waitForTimeout(1000);
    await tryClick(page, 'text=/Continue/i');
    await page.waitForTimeout(1500);
  }
  text = await body();
  if (text.includes('Perfect') || text.includes('get started')) await page.waitForTimeout(4000);
  for (let i = 0; i < 5; i++) {
    text = await body();
    if (text.includes('The Lotus Cycle')) break;
    await tryClick(page, 'text=/^Next$/i') || await tryClick(page, 'text=/Get Started/i');
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);
  console.log('Main app loaded!');

  // Click the synopsis to expand it
  await tryClick(page, 'text=/How the Lotus Cycle Works/i');
  await page.waitForTimeout(1000);

  // Scroll down a little to show the expanded content
  await page.mouse.move(200, 350);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(200); }
  await page.waitForTimeout(500);

  await page.screenshot({ path: `${OUT}/screenshot_synopsis_expanded.png` });
  console.log('Saved: synopsis expanded (top)');

  // Scroll more to show remaining stages
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(200); }
  await page.waitForTimeout(500);

  await page.screenshot({ path: `${OUT}/screenshot_synopsis_expanded2.png` });
  console.log('Saved: synopsis expanded (bottom)');

  await browser.close();
  console.log('All done!');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
