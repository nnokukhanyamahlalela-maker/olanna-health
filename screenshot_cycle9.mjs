import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function clickIfVisible(page, selector, timeout = 1500) {
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout }).catch(() => false)) {
    await el.click();
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

async function getText(page) {
  return await page.evaluate(() => document.body.innerText.substring(0, 200));
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  
  // Wait for app to load
  for (let i = 0; i < 20; i++) {
    const hasContent = await page.evaluate(() => document.body.innerText.length > 10);
    if (hasContent) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(2000);

  let t = await getText(page);
  console.log('==> State:', t.replace(/\n/g,' | ').substring(0, 80));

  // If on "Nice to meet you" confirmation, click Continue
  if (t.includes('Nice to meet you')) {
    await clickIfVisible(page, 'text=Continue');
    console.log('Passed name confirmation');
    t = await getText(page);
    console.log('==> State:', t.replace(/\n/g,' | ').substring(0, 80));
  }

  // If on intro
  if (t.includes("I'm Olanna")) {
    await clickIfVisible(page, 'text=Continue');
    console.log('Passed intro');
    t = await getText(page);
    
    // Name screen
    if (t.includes('what shall I call you')) {
      const input = page.locator('input').first();
      await input.click();
      await input.fill('Amara');
      await page.waitForTimeout(300);
      await clickIfVisible(page, 'text=Continue');
      console.log('Passed name');
      t = await getText(page);
      
      // Name confirmation
      if (t.includes('Nice to meet you')) {
        await clickIfVisible(page, 'text=Continue');
        console.log('Passed name confirmation');
        t = await getText(page);
      }
    }
  }

  console.log('==> State:', t.replace(/\n/g,' | ').substring(0, 80));

  // Cycle profile
  if (t.includes('Tell me about your cycle') || t.includes('Enter manually')) {
    await clickIfVisible(page, 'text=Enter manually', 1000);
    await page.waitForTimeout(500);
    // Scroll down to reveal Continue button
    const contBtn = page.locator('[aria-label="Continue"]');
    await contBtn.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    await contBtn.click().catch(async () => {
      // Try text version
      await page.locator('text=Continue').first().click().catch(() => {});
    });
    await page.waitForTimeout(1500);
    console.log('Passed cycle profile');
    t = await getText(page);
    console.log('==> State:', t.replace(/\n/g,' | ').substring(0, 80));
  }

  // Goals
  if (t.includes('pleasure') || t.includes('Track my period')) {
    // Select a goal
    await clickIfVisible(page, 'text=Track my period', 1000);
    // Click Continue
    await clickIfVisible(page, 'text=Continue');
    console.log('Passed goals');
    t = await getText(page);
    console.log('==> State:', t.replace(/\n/g,' | ').substring(0, 80));
  }

  // Any remaining Continue screens (confirmation, etc.)
  for (let i = 0; i < 5; i++) {
    t = await getText(page);
    if (t.includes('The Lotus Cycle') || t.includes('Check-in') || t.includes('Day ')) break;
    
    if (t.includes('Get Started')) {
      await clickIfVisible(page, 'text=Get Started');
      console.log('Passed carousel');
      break;
    }
    if (await clickIfVisible(page, 'text=Continue', 1200)) {
      console.log('Continue (remaining)');
    } else {
      break;
    }
  }

  await page.waitForTimeout(3000);

  // Navigate to Cycle tab
  t = await getText(page);
  console.log('==> Final state:', t.replace(/\n/g,' | ').substring(0, 100));
  
  if (!t.includes('The Lotus Cycle')) {
    const cycleTab = page.locator('[aria-label="Cycle"]').first();
    if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cycleTab.click();
      await page.waitForTimeout(3000);
      console.log('Cycle tab clicked');
    }
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
