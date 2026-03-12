import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  for (let i = 0; i < 10; i++) {
    const hasContent = await page.evaluate(() => document.body.innerText.length > 20);
    if (hasContent) break;
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(1500);

  // We should be on the goals page from last run
  let text = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('Start:', text.replace(/\n/g, ' | ').substring(0, 100));

  // Attempt up to 20 steps to get through onboarding
  for (let attempt = 0; attempt < 20; attempt++) {
    text = await page.evaluate(() => document.body.innerText);
    
    if (text.includes('The Lotus Cycle') || text.includes('Phase Insights') || text.includes('Day 1')) {
      console.log('On main Cycle screen!');
      break;
    }

    // Try Get Started (carousel end)
    const gs = page.locator('text=Get Started').first();
    if (await gs.isVisible({ timeout: 800 }).catch(() => false)) {
      await gs.click();
      await page.waitForTimeout(2000);
      console.log('Get Started');
      continue;
    }

    // Try Continue — scroll to it first
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 800 }).catch(() => false)) {
      await cont.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
      await cont.click();
      await page.waitForTimeout(1500);
      console.log('Continue');
      continue;
    }

    // Try Skip for now
    const skip = page.locator('text=Skip for now').first();
    if (await skip.isVisible({ timeout: 800 }).catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(1500);
      console.log('Skip for now');
      continue;
    }

    // Try Skip
    const skip2 = page.locator('text=Skip').first();
    if (await skip2.isVisible({ timeout: 800 }).catch(() => false)) {
      await skip2.click();
      await page.waitForTimeout(1500);
      console.log('Skip');
      continue;
    }

    // Try Next
    const next = page.locator('text=Next').first();
    if (await next.isVisible({ timeout: 800 }).catch(() => false)) {
      await next.click();
      await page.waitForTimeout(1500);
      console.log('Next');
      continue;
    }

    console.log('No button found, text:', text.substring(0, 80).replace(/\n/g,' | '));
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(2000);

  // Navigate to Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
