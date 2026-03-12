import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  for (let i = 0; i < 15; i++) {
    const hasText = await page.evaluate(() => document.body.innerText.includes('Continue') || document.body.innerText.includes('Lotus'));
    if (hasText) break;
    await page.waitForTimeout(2000);
  }

  // We're on the cycle profile step — scroll and click Continue
  const continueByLabel = page.locator('[aria-label="Continue"]');
  await continueByLabel.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  if (await continueByLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
    await continueByLabel.click();
    await page.waitForTimeout(1500);
    console.log('Clicked Continue on cycle profile');
  } else {
    // Force click
    await page.evaluate(() => {
      const el = document.querySelector('[aria-label="Continue"]');
      if (el) el.click();
    });
    await page.waitForTimeout(1500);
    console.log('Force-clicked Continue');
  }

  // Click through remaining steps
  for (let step = 0; step < 6; step++) {
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 80));
    console.log(`Step: ${bodyText.replace(/\n/g, ' | ')}`);

    const getStarted = page.locator('text=Get Started').first();
    if (await getStarted.isVisible({ timeout: 1500 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(2500);
      console.log('Clicked Get Started');
      break;
    }
    
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
      console.log(`Clicked Continue`);
      continue;
    }
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(3000);

  // Navigate to Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('On Cycle tab');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus Cycle visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
