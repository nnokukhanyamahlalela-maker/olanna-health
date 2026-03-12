import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  // Clear storage to start fresh
  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Wait for content
  for (let i = 0; i < 20; i++) {
    const anyContent = await page.evaluate(() => document.body.innerText.length > 20);
    if (anyContent) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(2000);
  
  // Clear AsyncStorage to force fresh onboarding
  await page.evaluate(() => {
    try { localStorage.clear(); } catch(e) {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);

  // Wait for app content
  for (let i = 0; i < 15; i++) {
    const hasText = await page.evaluate(() => document.body.innerText.length > 20);
    if (hasText) break;
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(2000);

  // Take debug screenshot to see current state
  await page.screenshot({ path: `${OUT}/debug_state.png` });
  console.log('Debug screenshot saved. Current text:');
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log(bodyText);

  // Step 1: Intro — "Continue"
  let btn = page.locator('text=Continue').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1500);
    console.log('1: Intro done');
  }

  // Step 2: Name input
  const nameInput = page.locator('input').first();
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill('Amara');
    await page.waitForTimeout(500);
    btn = page.locator('text=Continue').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
    console.log('2: Name done');
  }

  // Step 3: Cycle profile — click "Enter manually" then scroll and Continue
  btn = page.locator('text=Enter manually').first();
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1000);
    console.log('3: Enter manually clicked');
    
    // Scroll the page to reveal Continue button
    for (let s = 0; s < 5; s++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(500);
    
    btn = page.locator('text=Continue').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      console.log('4: Cycle profile submitted');
    } else {
      console.log('4: Continue not found after scroll, trying keyboard...');
      await page.keyboard.press('End');
      await page.waitForTimeout(500);
      btn = page.locator('text=Continue').first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
        console.log('4: Cycle profile submitted (via End key)');
      }
    }
  }

  // Step 5: Goals — Continue
  btn = page.locator('text=Continue').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1500);
    console.log('5: Goals done');
  }

  // Step 6: Confirmation — Continue
  btn = page.locator('text=Continue').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1500);
    console.log('6: Confirmation done');
  }

  // Step 7: Carousel — Get Started
  btn = page.locator('text=Get Started').first();
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(3000);
    console.log('7: Get Started clicked');
  }

  await page.waitForTimeout(3000);

  // Check what we see now
  const currentText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('Current view:', currentText);

  // Try to tap Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  } else {
    // Maybe we're already on it, or try finding it differently
    const allAriaLabels = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[aria-label]')).map(el => el.getAttribute('aria-label'));
    });
    console.log('Available aria-labels:', allAriaLabels.join(', '));
  }

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Saved final screenshot');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
