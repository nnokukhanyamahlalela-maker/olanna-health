import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(2000);

  // We're on the cycle profile page from last run. 
  // The "Continue" button should exist at the bottom. Let's find ALL buttons/clickable elements.
  const allButtons = await page.evaluate(() => {
    // Find all elements with text "Continue" or role "button"
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node;
    while (node = walker.nextNode()) {
      const el = node;
      const text = el.textContent?.trim();
      const ariaLabel = el.getAttribute('aria-label');
      const role = el.getAttribute('role');
      if ((text === 'Continue' || ariaLabel === 'Continue') && (role === 'button' || el.tagName === 'BUTTON' || el.getAttribute('tabindex') !== null)) {
        const rect = el.getBoundingClientRect();
        results.push({ tag: el.tagName, text, ariaLabel, role, top: rect.top, left: rect.left, width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 });
      }
    }
    return results;
  });
  console.log('Continue buttons found:', JSON.stringify(allButtons, null, 2));

  // Try scrolling the page itself
  await page.evaluate(() => window.scrollTo(0, 9999));
  await page.waitForTimeout(500);
  
  // Also try touch-based scroll
  await page.touchscreen.tap(200, 400);
  await page.waitForTimeout(200);
  
  // Swipe up
  for (let s = 0; s < 8; s++) {
    await page.mouse.move(200, 500);
    await page.mouse.down();
    await page.mouse.move(200, 200, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
  }

  // Check Continue again
  const cont = page.locator('[aria-label="Continue"]').first();
  const isVis = await cont.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('Continue visible after scroll:', isVis);
  
  if (isVis) {
    await cont.click();
    await page.waitForTimeout(1500);
    console.log('Clicked Continue');
  } else {
    // Force click through JS
    const clicked = await page.evaluate(() => {
      const el = document.querySelector('[aria-label="Continue"]');
      if (el) {
        el.scrollIntoView();
        el.click();
        return true;
      }
      // Try all elements with text "Continue"
      const all = document.querySelectorAll('[role="button"]');
      for (const btn of all) {
        if (btn.textContent?.trim() === 'Continue') {
          btn.scrollIntoView();
          btn.click();
          return true;
        }
      }
      return false;
    });
    console.log('Force click result:', clicked);
    await page.waitForTimeout(1500);
  }

  // Check state
  let text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('After cycle profile:', text.replace(/\n/g, ' | '));

  // Goals — select and continue
  if (text.includes('pleasure') || text.includes('Track my period')) {
    await page.locator('text=Track my period').first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('text=Continue').first().click().catch(() => {});
    await page.waitForTimeout(1500);
    console.log('Passed goals');
    text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  }

  // Remaining steps
  for (let i = 0; i < 8; i++) {
    text = await page.evaluate(() => document.body.innerText.substring(0, 100));
    if (text.includes('The Lotus Cycle') || text.includes('Day ')) break;
    if (text.includes('Get Started')) {
      await page.locator('text=Get Started').first().click();
      await page.waitForTimeout(2500);
      console.log('Get Started');
      break;
    }
    const c = page.locator('text=Continue').first();
    if (await c.isVisible({ timeout: 1000 }).catch(() => false)) {
      await c.click();
      await page.waitForTimeout(1500);
      console.log('Continue step');
    } else break;
  }

  await page.waitForTimeout(3000);

  // Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
