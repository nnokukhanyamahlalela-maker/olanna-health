import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  // First load to get app initialized
  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  for (let i = 0; i < 15; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);
  
  // Check what keys already exist in localStorage
  const keys = await page.evaluate(() => {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result.push(key);
    }
    return result;
  });
  console.log('Existing keys:', keys);

  // Complete onboarding the fast way — run through all steps
  // Step 1: Intro
  await page.locator('text=Continue').first().click();
  await page.waitForTimeout(1500);
  
  // Step 2: Name
  let text = await page.evaluate(() => document.body.innerText.substring(0, 60));
  console.log('After intro:', text.replace(/\n/g, ' | '));
  if (text.includes('what shall I call you')) {
    const input = page.locator('input').first();
    await input.click();
    await page.keyboard.type('Amara', { delay: 30 });
    await page.waitForTimeout(300);
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
  }
  
  // Step 3: Greeting
  text = await page.evaluate(() => document.body.innerText.substring(0, 60));
  if (text.includes('Nice to meet you')) {
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
  }

  // Step 4: Profile (may be skipped)
  text = await page.evaluate(() => document.body.innerText.substring(0, 80));
  console.log('After greeting:', text.replace(/\n/g, ' | '));
  if (text.includes('Tell me about your cycle')) {
    await page.locator('[aria-label="Continue"]').click({ timeout: 3000 });
    await page.waitForTimeout(1500);
  }

  // Step 5: Goals
  text = await page.evaluate(() => document.body.innerText.substring(0, 80));
  console.log('Goals screen:', text.replace(/\n/g, ' | '));
  if (text.includes('pleasure') || text.includes('Track my period')) {
    await page.locator('text=Track my period').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
  }

  // Step 6: Confirmation
  text = await page.evaluate(() => document.body.innerText.substring(0, 60));
  console.log('After goals:', text.replace(/\n/g, ' | '));
  if (text.includes('Perfect')) {
    await page.waitForTimeout(2000);
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1500 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
    }
  }

  // Step 7: Carousel — click Next until Get Started
  text = await page.evaluate(() => document.body.innerText.substring(0, 60));
  console.log('Carousel:', text.replace(/\n/g, ' | '));
  for (let i = 0; i < 6; i++) {
    const gs = page.locator('text=Get Started').first();
    if (await gs.isVisible({ timeout: 500 }).catch(() => false)) {
      await gs.click();
      await page.waitForTimeout(2000);
      console.log('Get Started!');
      break;
    }
    const next = page.locator('text=Next').first();
    if (await next.isVisible({ timeout: 500 }).catch(() => false)) {
      await next.click();
      await page.waitForTimeout(800);
    }
  }

  await page.waitForTimeout(3000);
  text = await page.evaluate(() => document.body.innerText.substring(0, 80));
  console.log('Main app:', text.replace(/\n/g, ' | '));

  // Dump localStorage keys after onboarding
  const keysAfter = await page.evaluate(() => {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result.push(key + ' = ' + localStorage.getItem(key)?.substring(0, 40));
    }
    return result;
  });
  console.log('Keys after onboarding:');
  keysAfter.forEach(k => console.log('  ', k));

  // Navigate to Learn
  const learnTab = page.locator('[aria-label="Learn"]').first();
  if (await learnTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await learnTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_learn.png` });
    console.log('Learn saved!');
  }

  // Health
  const healthTab = page.locator('[aria-label="Health"]').first();
  if (await healthTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await healthTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_health.png` });
    console.log('Health saved!');
  }

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
