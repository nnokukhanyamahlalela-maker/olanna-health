import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Pre-seed localStorage with onboarding data
  await page.evaluate(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('@olanna_onboarding_complete', '"true"');
    localStorage.setItem('@olanna_user_profile', JSON.stringify({
      name: 'Amara',
      userId: 'user-1'
    }));
    localStorage.setItem('olanna_cycle_profile', JSON.stringify({
      userId: 'user-1',
      regularity: 'regular',
      lastPeriodStart: today,
      cycleLength: 28,
      periodLength: 5,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem('@olanna_health_goals', JSON.stringify(['period-tracking']));
  });
  
  await page.reload({ waitUntil: 'networkidle' });
  
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(5000);

  let text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('State:', text.replace(/\n/g, ' | ').substring(0, 80));

  // Should be on main app. Navigate to Learn tab
  const learnTab = page.locator('[aria-label="Learn"]').first();
  if (await learnTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await learnTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/appstore_learn.png` });
    console.log('Learn saved!');
    
    // Also get Health tab
    const healthTab = page.locator('[aria-label="Health"]').first();
    if (await healthTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await healthTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT}/appstore_health.png` });
      console.log('Health saved!');
    }
  } else {
    console.log('Not on main app');
    const labels = await page.evaluate(() => 
      Array.from(document.querySelectorAll('[aria-label]')).map(e => e.getAttribute('aria-label')).join(', ')
    );
    console.log('Labels:', labels);
    await page.screenshot({ path: `${OUT}/debug_learn.png` });
  }

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
