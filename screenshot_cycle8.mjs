import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 720 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8081', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  for (let i = 0; i < 10; i++) {
    const hasContent = await page.evaluate(() => document.body.innerText.length > 20);
    if (hasContent) break;
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(1500);

  let text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('Start:', text.replace(/\n/g, ' | '));

  // Step 1: Intro
  if (text.includes("I'm Olanna")) {
    await page.locator('text=Continue').first().click();
    await page.waitForTimeout(1500);
    console.log('Passed intro');
  }

  // Step 2: Name — find all input-like elements
  text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  if (text.includes('what shall I call you')) {
    // Find TextInput (React Native renders as <input> on web)
    const inputs = await page.locator('input[type="text"], input:not([type]), [role="textbox"]').all();
    console.log(`Found ${inputs.length} input(s)`);
    
    if (inputs.length > 0) {
      await inputs[0].click();
      await page.waitForTimeout(300);
      await inputs[0].fill('Amara');
      await page.waitForTimeout(300);
    } else {
      // Try contenteditable or other RN web patterns
      const editable = await page.locator('[contenteditable="true"], [data-focusable="true"]').all();
      console.log(`Found ${editable.length} editable(s)`);
      if (editable.length > 0) {
        await editable[0].click();
        await page.keyboard.type('Amara');
        await page.waitForTimeout(300);
      }
    }
    
    // Now find Continue - might need to look for all clickable text
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
      console.log('Passed name');
    } else {
      console.log('Continue not visible after name. Trying aria-label...');
      const ariaBtn = page.locator('[aria-label="Continue"]').first();
      if (await ariaBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await ariaBtn.click();
        await page.waitForTimeout(1500);
        console.log('Passed name via aria');
      } else {
        // Debug: what HTML elements exist
        const html = await page.evaluate(() => {
          const els = document.querySelectorAll('input, [contenteditable], [role="textbox"], [data-testid]');
          return Array.from(els).map(e => `${e.tagName}[type=${e.getAttribute('type')},role=${e.getAttribute('role')},testid=${e.getAttribute('data-testid')}]`).join('\n');
        });
        console.log('Elements:', html);
      }
    }
  }

  text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('After name:', text.replace(/\n/g, ' | '));

  // Step 3: Cycle profile
  if (text.includes('Tell me about your cycle') || text.includes('Enter manually')) {
    const manual = page.locator('text=Enter manually').first();
    if (await manual.isVisible({ timeout: 1000 }).catch(() => false)) {
      await manual.click();
      await page.waitForTimeout(500);
    }
    // Scroll and click Continue
    const cont = page.locator('[aria-label="Continue"]');
    await cont.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    await cont.click().catch(() => {});
    await page.waitForTimeout(1500);
    console.log('Passed cycle profile');
  }

  // Step 4: Goals
  text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('After cycle:', text.replace(/\n/g, ' | '));
  if (text.includes('pleasure') || text.includes('goals') || text.includes('Track my period')) {
    // Select one goal then Continue
    const track = page.locator('text=Track my period').first();
    if (await track.isVisible({ timeout: 1000 }).catch(() => false)) {
      await track.click();
      await page.waitForTimeout(500);
    }
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1500 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
      console.log('Passed goals');
    }
  }

  // Step 5-6: Continue through remaining
  for (let i = 0; i < 5; i++) {
    text = await page.evaluate(() => document.body.innerText.substring(0, 80));
    console.log(`Remaining step ${i}:`, text.replace(/\n/g, ' | '));
    
    if (text.includes('The Lotus Cycle') || text.includes('Phase Insights')) break;
    
    const gs = page.locator('text=Get Started').first();
    if (await gs.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gs.click();
      await page.waitForTimeout(2500);
      console.log('Get Started');
      break;
    }
    const cont = page.locator('text=Continue').first();
    if (await cont.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(1500);
      console.log('Continue');
      continue;
    }
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(3000);

  // Cycle tab
  const cycleTab = page.locator('[aria-label="Cycle"]').first();
  if (await cycleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cycleTab.click();
    await page.waitForTimeout(3000);
    console.log('Cycle tab clicked');
  }

  const hasLotus = await page.locator('text=The Lotus Cycle').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Lotus visible:', hasLotus);

  await page.screenshot({ path: `${OUT}/appstore_lotus_cycle.png` });
  console.log('Done!');

  await browser.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
