import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3, hasTouch: true });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => document.body.innerText.length > 10)) break;
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(3000);

  let text = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('State:', text.replace(/\n/g, ' | ').substring(0, 120));

  // We're on the feature carousel. Look for "Get Started" or use dots/arrows
  // The carousel text mentions "Track your cycle" etc. Need to swipe/tap through
  
  // Try clicking "Get Started"
  let gs = page.locator('text=Get Started').first();
  if (await gs.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gs.click();
    await page.waitForTimeout(3000);
    console.log('Clicked Get Started');
  } else {
    // Maybe need to swipe through carousel first
    console.log('Get Started not visible, looking for navigation...');
    
    // Look for dots or next button
    const allBtns = await page.evaluate(() => {
      const btns = document.querySelectorAll('[role="button"], button');
      return Array.from(btns).map(b => ({
        text: b.textContent?.trim().substring(0, 30),
        ariaLabel: b.getAttribute('aria-label'),
        rect: b.getBoundingClientRect()
      }));
    });
    console.log('Buttons:', JSON.stringify(allBtns));
    
    // Swipe left to advance carousel
    for (let s = 0; s < 4; s++) {
      await page.mouse.move(350, 400);
      await page.mouse.down();
      await page.mouse.move(50, 400, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(800);
      
      gs = page.locator('text=Get Started').first();
      if (await gs.isVisible({ timeout: 500 }).catch(() => false)) {
        await gs.click();
        await page.waitForTimeout(3000);
        console.log('Clicked Get Started after swipe');
        break;
      }
    }
  }

  text = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('After carousel:', text.replace(/\n/g, ' | ').substring(0, 120));

  // Check if on main app
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  
  if (hasLotus) {
    // Also get calendar screenshot
    const calTab = page.locator('[aria-label="Calendar"]').first();
    if (await calTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await calTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT}/appstore_calendar.png` });
      console.log('Calendar saved');
    }
    
    // Check-in
    const checkTab = page.locator('[aria-label="Check-in"]').first();
    if (await checkTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await checkTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT}/appstore_checkin.png` });
      console.log('Check-in saved');
    }
    
    // Learn
    const learnTab = page.locator('[aria-label="Learn"]').first();
    if (await learnTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await learnTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${OUT}/appstore_learn.png` });
      console.log('Learn saved');
    }
  }

  console.log('Done!');
  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
