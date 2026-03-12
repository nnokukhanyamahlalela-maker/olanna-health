import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  // Fresh start — clear everything
  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  
  // Wait for app content
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);

  const step = async (label) => {
    const t = await page.evaluate(() => document.body.innerText.substring(0, 120));
    console.log(`[${label}] ${t.replace(/\n/g, ' | ').substring(0, 80)}`);
    return t;
  };

  // STEP 1: Intro splash — "Continue"
  let t = await step('1-pre');
  if (t.includes("I'm Olanna")) {
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(2000);
  }

  // STEP 2: Name — "And what shall I call you?"
  t = await step('2-pre');
  if (t.includes('what shall I call you')) {
    const input = page.locator('input').first();
    await input.click();
    await page.waitForTimeout(200);
    await page.keyboard.type('Amara', { delay: 50 });
    await page.waitForTimeout(500);
    
    // Check if Continue is now active
    t = await step('2-typed');
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(2000);
      console.log('Name submitted');
    }
  }

  // STEP 2b: "Nice to meet you, Amara" confirmation 
  t = await step('2b');
  if (t.includes('Nice to meet you')) {
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(2000);
    console.log('Name confirmed');
  }

  // STEP 3: Cycle profile — "Tell me about your cycle"
  t = await step('3-pre');
  if (t.includes('Tell me about your cycle') || t.includes('Enter manually')) {
    // Click "Enter manually" to ensure form is shown
    const manual = page.locator('text=Enter manually').first();
    if (await manual.isVisible({ timeout: 1000 }).catch(() => false)) {
      await manual.click();
      await page.waitForTimeout(800);
    }
    
    // The Continue button exists but may be at the bottom — let's check its position
    const btnInfo = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Continue"]');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, visible: r.width > 0 && r.height > 0 };
    });
    console.log('Continue button info:', JSON.stringify(btnInfo));
    
    // Click it
    await page.locator('[aria-label="Continue"]').click({ timeout: 3000 });
    await page.waitForTimeout(2000);
    console.log('Cycle profile submitted');
  }

  // STEP 4: Goals — "And to what do I owe this pleasure?"
  t = await step('4-pre');
  if (t.includes('pleasure') || t.includes('Track my period') || t.includes('Select all that apply')) {
    // Must select at least one goal
    const trackPeriod = page.locator('text=Track my period').first();
    if (await trackPeriod.isVisible({ timeout: 1000 }).catch(() => false)) {
      await trackPeriod.click();
      await page.waitForTimeout(500);
      console.log('Selected Track my period');
    }
    // Now Continue
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(2000);
      console.log('Goals submitted');
    }
  }

  // STEP 5: Summary/confirmation
  t = await step('5-pre');
  if (t.includes('Continue')) {
    if (!t.includes('The Lotus Cycle') && !t.includes('Get Started')) {
      await page.locator('text=Continue').first().click();
      await page.waitForTimeout(2000);
      console.log('Summary passed');
    }
  }

  // STEP 6: Feature carousel — "Get Started"
  t = await step('6-pre');
  if (t.includes('Get Started')) {
    await page.locator('text=Get Started').first().click();
    await page.waitForTimeout(3000);
    console.log('Carousel passed');
  }

  // Keep clicking Continue/Get Started if needed
  for (let i = 0; i < 5; i++) {
    t = await page.evaluate(() => document.body.innerText.substring(0, 100));
    if (t.includes('The Lotus Cycle') || t.includes('Check-in') || t.includes('Calendar')) break;
    
    if (t.includes('Get Started')) {
      await page.locator('text=Get Started').first().click();
      await page.waitForTimeout(2000);
      continue;
    }
    const c = page.locator('text=Continue').first();
    if (await c.isVisible({ timeout: 1000 }).catch(() => false)) {
      await c.click();
      await page.waitForTimeout(1500);
      continue;
    }
    break;
  }

  await page.waitForTimeout(3000);

  // Final state
  t = await step('final');

  // Navigate to Cycle tab
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
