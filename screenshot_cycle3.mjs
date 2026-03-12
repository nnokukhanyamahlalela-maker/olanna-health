import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function clickText(page, text, timeout = 3000) {
  const el = page.locator(`text=${text}`).first();
  if (await el.isVisible({ timeout }).catch(() => false)) {
    await el.click();
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  
  // Wait for splash to clear
  for (let i = 0; i < 15; i++) {
    const ready = await page.locator('text=Continue').isVisible().catch(() => false)
      || await page.locator('text=The Lotus Cycle').isVisible().catch(() => false);
    if (ready) break;
    await page.waitForTimeout(2000);
  }

  // Onboarding: intro splash → Continue
  if (await clickText(page, 'Continue')) {
    console.log('Step 1: Intro');
    
    // Name input
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Amara');
      await page.waitForTimeout(500);
      await clickText(page, 'Continue');
      console.log('Step 2: Name');
    }

    // Enter manually (cycle profile)
    if (await clickText(page, 'Enter manually')) {
      console.log('Step 3: Enter manually');
      // Scroll down and click Continue
      await page.waitForTimeout(1000);
      // Need to scroll the form
      await page.evaluate(() => {
        const scrollable = document.querySelector('[data-testid="scroll-view"]') 
          || document.querySelector('div[style*="overflow"]');
        if (scrollable) scrollable.scrollTop = 999;
      });
      await page.waitForTimeout(500);
      await clickText(page, 'Continue');
      console.log('Step 4: Cycle data submitted');
    }

    // Goals page — just click Continue
    await clickText(page, 'Continue');
    console.log('Step 5: Goals');

    // Confirmation / summary — Continue
    await clickText(page, 'Continue');
    console.log('Step 6: Confirmation');

    // Feature carousel — Get Started
    await page.waitForTimeout(1000);
    await clickText(page, 'Get Started', 5000);
    console.log('Step 7: Get Started');
    
    await page.waitForTimeout(3000);
  }

  // Should be on main app now. Go to Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await cycleTab.click();
    console.log('Tapped Cycle tab');
    await page.waitForTimeout(3000);
  } else {
    console.log('No Cycle tab found, checking current state...');
    await page.screenshot({ path: `${OUT}/debug_state.png` });
  }

  // Verify
  const hasTitle = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('On Lotus Cycle screen:', hasTitle);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Saved: appstore_lotus_cycle.png');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
