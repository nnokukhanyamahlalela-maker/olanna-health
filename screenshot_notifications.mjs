import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  await page.goto('file:///home/runner/workspace/client/assets/notification-cards-preview.html', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Screenshot 1: Header + first "For Her" notifications
  await page.screenshot({ path: `${OUT}/screenshot_notif_her_1.png` });
  console.log('Saved: her notifications (top)');

  // Scroll to show more "For Her" cards
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/screenshot_notif_her_2.png` });
  console.log('Saved: her notifications (middle)');

  // Scroll to show remaining "For Her" + start of Partner
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/screenshot_notif_her_3.png` });
  console.log('Saved: her notifications (bottom) + partner start');

  // Scroll to show partner notifications
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/screenshot_notif_partner_1.png` });
  console.log('Saved: partner notifications (top)');

  // Scroll to show remaining partner notifications
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/screenshot_notif_partner_2.png` });
  console.log('Saved: partner notifications (bottom)');

  await browser.close();
  console.log('All done!');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
