import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(2000);

  // We're on the cycle profile page. The Continue button at y=618 is visible.
  // Just click at that coordinate
  await page.click('[aria-label="Continue"]', { timeout: 3000 });
  await page.waitForTimeout(2000);
  console.log('Clicked Continue on cycle profile');

  let text = await page.evaluate(() => document.body.innerText.substring(0, 150));
  console.log('After:', text.replace(/\n/g, ' | ').substring(0, 100));

  // Goals
  if (text.includes('pleasure') || text.includes('Track my period')) {
    await page.locator('text=Track my period').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('text=Continue').first().click().catch(() => {});
    await page.waitForTimeout(1500);
    console.log('Passed goals');
    text = await page.evaluate(() => document.body.innerText.substring(0, 150));
    console.log('After goals:', text.replace(/\n/g, ' | ').substring(0, 100));
  }

  // Step through remaining
  for (let i = 0; i < 8; i++) {
    text = await page.evaluate(() => document.body.innerText.substring(0, 150));
    if (text.includes('The Lotus Cycle') || text.includes('Day ') || text.includes('Check-in')) break;
    
    if (text.includes('Get Started')) {
      await page.locator('text=Get Started').first().click();
      await page.waitForTimeout(2500);
      console.log('Get Started clicked');
      break;
    }
    const c = page.locator('text=Continue').first();
    if (await c.isVisible({ timeout: 1200 }).catch(() => false)) {
      await c.click();
      await page.waitForTimeout(1500);
      console.log('Continue step', i);
    } else break;
  }

  await page.waitForTimeout(3000);

  // Navigate to Cycle tab
  text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('Before tab:', text.replace(/\n/g, ' | ').substring(0, 80));
  
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Screenshot saved!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
