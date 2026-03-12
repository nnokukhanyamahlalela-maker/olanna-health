import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  // Wait for any content
  for (let i = 0; i < 15; i++) {
    const hasContent = await page.evaluate(() => document.body.innerText.length > 20);
    if (hasContent) break;
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(2000);

  // Log current state
  let text = await page.evaluate(() => document.body.innerText.substring(0, 150));
  console.log('Current:', text.replace(/\n/g, ' | '));

  // Complete onboarding dynamically — handle each screen
  for (let attempt = 0; attempt < 15; attempt++) {
    text = await page.evaluate(() => document.body.innerText.substring(0, 200));
    
    // Already past onboarding
    if (text.includes('The Lotus Cycle') || text.includes('Phase Insights')) {
      console.log('Already on Lotus Cycle!');
      break;
    }

    // Intro splash
    if (text.includes("I'm Olanna") || text.includes("Hi.")) {
      const btn = page.locator('text=Continue').first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
        console.log('Passed intro');
        continue;
      }
    }

    // Name input
    if (text.includes('what shall I call you')) {
      const input = page.locator('input').first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill('Amara');
        await page.waitForTimeout(300);
      }
      const btn = page.locator('text=Continue').first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
        console.log('Passed name');
        continue;
      }
    }

    // Cycle profile — Enter manually step
    if (text.includes('Tell me about your cycle') || text.includes('Enter manually')) {
      // Make sure "Enter manually" is selected
      const manualBtn = page.locator('text=Enter manually').first();
      if (await manualBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await manualBtn.click();
        await page.waitForTimeout(500);
      }
      // Scroll down to find Continue
      const continueBtn = page.locator('[aria-label="Continue"]');
      await continueBtn.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
      if (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(1500);
        console.log('Passed cycle profile');
        continue;
      }
    }

    // Goals / health focus
    if (text.includes('goals') || text.includes('focus') || text.includes('matters to you') || text.includes('health priorities')) {
      const btn = page.locator('text=Continue').first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
        console.log('Passed goals');
        continue;
      }
    }

    // Carousel / feature overview
    if (text.includes('Get Started')) {
      const btn = page.locator('text=Get Started').first();
      await btn.click();
      await page.waitForTimeout(2500);
      console.log('Passed carousel');
      continue;
    }

    // Generic Continue
    const genericCont = page.locator('text=Continue').first();
    if (await genericCont.isVisible({ timeout: 1000 }).catch(() => false)) {
      await genericCont.click();
      await page.waitForTimeout(1500);
      console.log('Generic Continue click');
      continue;
    }

    // Nothing to click, wait
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(2000);

  // Try Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  }

  text = await page.evaluate(() => document.body.innerText.substring(0, 150));
  console.log('Final state:', text.replace(/\n/g, ' | '));

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
