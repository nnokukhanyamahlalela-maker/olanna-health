import { chromium } from 'playwright';

const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);

  // Complete onboarding
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(1500);
  const nameInput = page.locator('input').first();
  await nameInput.click();
  await page.keyboard.type('Amara', { delay: 30 });
  await page.waitForTimeout(300);
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(1500);
  let t = await page.evaluate(() => document.body.innerText.substring(0, 60));
  if (t.includes('Nice to meet you')) {
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
  }
  t = await page.evaluate(() => document.body.innerText.substring(0, 80));
  if (t.includes('Tell me about your cycle')) {
    await page.locator('[aria-label="Continue"]').click({ timeout: 3000 });
    await page.waitForTimeout(1500);
  }
  t = await page.evaluate(() => document.body.innerText.substring(0, 80));
  if (t.includes('pleasure') || t.includes('Track my period')) {
    await page.locator('text=Track my period').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
  }
  t = await page.evaluate(() => document.body.innerText.substring(0, 60));
  if (t.includes('Perfect')) {
    await page.waitForTimeout(2500);
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1500 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
    }
  }
  for (let i = 0; i < 6; i++) {
    const gs = page.locator('text=Get Started').first();
    if (await gs.isVisible({ timeout: 500 }).catch(() => false)) {
      await gs.click();
      await page.waitForTimeout(2000);
      break;
    }
    const next = page.locator('text=Next').first();
    if (await next.isVisible({ timeout: 500 }).catch(() => false)) {
      await next.click();
      await page.waitForTimeout(800);
    }
  }
  await page.waitForTimeout(3000);

  // Test all tabs
  const tabs = ['Cycle', 'Calendar', 'Check-in', 'Health', 'Learn'];
  for (const tab of tabs) {
    const tabEl = page.locator(`[aria-label="${tab}"]`).first();
    if (await tabEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tabEl.click();
      await page.waitForTimeout(2000);
      console.log(`✓ ${tab} tab loaded`);
    } else {
      console.log(`✗ ${tab} tab NOT found`);
    }
  }

  // Test tappable phase flowers on Cycle tab
  await page.locator('[aria-label="Cycle"]').first().click();
  await page.waitForTimeout(2000);

  const phases = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'];
  for (const phase of phases) {
    const el = page.locator(`text=${phase}`).first();
    if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(800);
      const hasCard = await page.evaluate((p) => {
        const stageNames = { 'Menstrual': 'The Bud', 'Follicular': 'The Rising Lotus', 'Ovulatory': 'Full Bloom', 'Luteal': 'The Closing Lotus' };
        return document.body.innerText.includes(stageNames[p]);
      }, phase);
      console.log(`✓ ${phase} flower tap → synopsis ${hasCard ? 'visible' : 'NOT visible'}`);
      // Tap again to dismiss
      await el.click();
      await page.waitForTimeout(500);
    }
  }

  // Report errors
  const realErrors = errors.filter(e => 
    !e.includes('baseline-browser-mapping') && 
    !e.includes('expo-asset') &&
    !e.includes('Failed to load resource')
  );
  if (realErrors.length > 0) {
    console.log('\n⚠ Console errors:');
    realErrors.forEach(e => console.log('  ', e.substring(0, 120)));
  } else {
    console.log('\n✓ No console errors');
  }

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
