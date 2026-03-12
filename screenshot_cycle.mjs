import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Complete onboarding if needed
  const continueBtn = page.getByText('Continue');
  if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
    // Name input
    const nameInput = page.locator('input[placeholder]').first();
    if (await nameInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await nameInput.fill('Amara');
      await page.waitForTimeout(500);
      await page.getByText('Continue').click();
      await page.waitForTimeout(1000);
    }
    // Enter manually
    const manualBtn = page.getByText('Enter manually');
    if (await manualBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await manualBtn.click();
      await page.waitForTimeout(1000);
      await page.getByText('Continue').click();
      await page.waitForTimeout(1000);
    }
    // Goals
    const goalsNext = page.getByText('Continue');
    if (await goalsNext.isVisible({ timeout: 1500 }).catch(() => false)) {
      await goalsNext.click();
      await page.waitForTimeout(1000);
    }
    // Confirmation
    const confNext = page.getByText('Continue');
    if (await confNext.isVisible({ timeout: 1500 }).catch(() => false)) {
      await confNext.click();
      await page.waitForTimeout(1000);
    }
    // Get Started / carousel
    const getStarted = page.getByText('Get Started');
    if (await getStarted.isVisible({ timeout: 2000 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(2000);
    }
  }

  // Navigate to Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]');
  if (await cycleTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(2000);
  }

  // Take screenshot of the Lotus Cycle screen with the new slideshow
  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Saved: appstore_lotus_cycle.png');

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
