import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function getText(page) {
  return await page.evaluate(() => document.body.innerText);
}

async function log(page, label) {
  const t = await page.evaluate(() => document.body.innerText.substring(0, 120));
  console.log(`[${label}] ${t.replace(/\n/g, ' | ')}`);
  return t;
}

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  // Clear and start fresh
  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);

  // STEP 1: intro — "Hi. I'm Olanna." → Continue
  await log(page, '1');
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(2000);

  // STEP 2: name — type and Continue
  await log(page, '2');
  const nameInput = page.locator('input').first();
  await nameInput.click();
  await page.keyboard.type('Amara', { delay: 50 });
  await page.waitForTimeout(500);
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(2000);

  // STEP 3: greeting — "Nice to meet you" → Continue
  await log(page, '3');
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(2000);

  // STEP 4: profile — cycle profile form OR skip
  let t = await log(page, '4');
  if (t.includes('Tell me about your cycle') || t.includes('Enter manually')) {
    const manual = page.locator('text=Enter manually').first();
    if (await manual.isVisible({ timeout: 1000 }).catch(() => false)) {
      await manual.click();
      await page.waitForTimeout(800);
    }
    // Click Continue (it's at y=618, visible)
    await page.locator('[aria-label="Continue"]').click({ timeout: 3000 });
    await page.waitForTimeout(2000);
    console.log('Profile submitted');
  } else if (t.includes('pleasure') || t.includes('Track my period')) {
    // Profile was skipped, already on goals
    console.log('Profile was skipped');
  }

  // STEP 5: goals — select "Track my period" → Continue
  t = await log(page, '5');
  if (t.includes('pleasure') || t.includes('Track my period') || t.includes('Select all that apply')) {
    await page.locator('text=Track my period').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(2000);
    console.log('Goals submitted');
  }

  // STEP 6: confirmation — "Perfect. Let's get started." → auto-advance or Continue
  t = await log(page, '6');
  if (t.includes('Perfect') || t.includes("Let's get started")) {
    // Wait for it to auto-advance or click Continue
    await page.waitForTimeout(3000);
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(2000);
    }
  }

  // STEP 7: carousel — click Next through slides, then Get Started
  t = await log(page, '7');
  if (t.includes('Track your cycle') || t.includes('Next') || t.includes('Log your')) {
    for (let i = 0; i < 6; i++) {
      const gs = page.locator('text=Get Started').first();
      if (await gs.isVisible({ timeout: 800 }).catch(() => false)) {
        await gs.click();
        await page.waitForTimeout(3000);
        console.log('Get Started clicked');
        break;
      }
      const next = page.locator('text=Next').first();
      if (await next.isVisible({ timeout: 800 }).catch(() => false)) {
        await next.click();
        await page.waitForTimeout(1000);
        console.log('Next slide');
      }
    }
  }

  // Should be on main app now
  await page.waitForTimeout(3000);
  t = await log(page, 'main');

  // Try clicking Cycle tab
  const allLabels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[aria-label]'))
      .map(el => el.getAttribute('aria-label'))
      .filter(Boolean);
  });
  console.log('Labels:', allLabels.slice(0, 20).join(', '));

  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
  } else {
    // Try Cycle, Cycle tab
    const tab = page.locator('[aria-label="Cycle, tab, 1 of 5"]').first();
    if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(3000);
    }
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  if (hasLotus) {
    await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
    console.log('Lotus saved!');

    // Calendar
    await page.locator('[aria-label="Calendar, tab, 2 of 5"]').first().click().catch(async () => {
      await page.locator('[aria-label="Calendar"]').first().click().catch(() => {});
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_calendar.png` });
    console.log('Calendar saved!');

    // Check-in
    await page.locator('[aria-label="Check-in, tab, 3 of 5"]').first().click().catch(async () => {
      await page.locator('[aria-label="Check-in"]').first().click().catch(() => {});
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_checkin.png` });
    console.log('Check-in saved!');

    // Learn
    await page.locator('[aria-label="Learn, tab, 5 of 5"]').first().click().catch(async () => {
      await page.locator('[aria-label="Learn"]').first().click().catch(() => {});
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_learn.png` });
    console.log('Learn saved!');
  } else {
    await page.screenshot({ path: `${OUT}/debug_final.png` });
    console.log('Debug screenshot saved (not on Lotus)');
  }

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
