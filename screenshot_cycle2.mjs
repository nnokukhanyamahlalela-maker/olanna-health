import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);

  // Wait for splash to finish — look for onboarding or main app
  // Try to find "Continue" button (onboarding) or tab bar
  for (let i = 0; i < 10; i++) {
    const hasContent = await page.locator('text=Continue').isVisible().catch(() => false)
      || await page.locator('text=The Lotus Cycle').isVisible().catch(() => false)
      || await page.locator('[aria-label="Cycle"]').isVisible().catch(() => false);
    if (hasContent) break;
    await page.waitForTimeout(2000);
    console.log(`Waiting for app to load... attempt ${i+1}`);
  }

  // If we see onboarding, complete it
  const continueBtn = page.locator('text=Continue').first();
  if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Completing onboarding...');
    await continueBtn.click();
    await page.waitForTimeout(1500);

    // Name
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Amara');
      await page.waitForTimeout(500);
      const nextBtn = page.locator('text=Continue').first();
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Enter manually
    const manualBtn = page.locator('text=Enter manually').first();
    if (await manualBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await manualBtn.click();
      await page.waitForTimeout(1500);
      const nextBtn = page.locator('text=Continue').first();
      if (await nextBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Keep clicking Continue through remaining steps
    for (let step = 0; step < 5; step++) {
      const btn = page.locator('text=Continue').first();
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Get Started
    const getStarted = page.locator('text=Get Started').first();
    if (await getStarted.isVisible({ timeout: 2000 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(3000);
    }
  }

  // Now we should be on the main app. Navigate to Cycle tab
  await page.waitForTimeout(2000);
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(2500);
  }

  // Verify we see the Lotus Cycle screen
  const lotusTitle = page.locator('text=The Lotus Cycle');
  if (await lotusTitle.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('On Lotus Cycle screen!');
  } else {
    console.log('WARNING: May not be on Cycle screen. Taking screenshot anyway.');
  }

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Saved: appstore_lotus_cycle.png');

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
