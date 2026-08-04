const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const APP_URL = "http://localhost:8081";
const OUT_DIR = path.join(__dirname, "../screenshots");
const CHROMIUM = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";
const W = 390, H = 844;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log(`  ✓ ${name}`);
}

async function clickText(page, text, timeout = 6000) {
  try {
    await page.waitForFunction(
      (t) => !!Array.from(document.querySelectorAll("div,span,p,button"))
        .find((e) => e.textContent.trim() === t && e.offsetParent !== null),
      { timeout }, text
    );
    await page.evaluate((t) => {
      const el = Array.from(document.querySelectorAll("div,span,p,button"))
        .find((e) => e.textContent.trim() === t && e.offsetParent !== null);
      if (el) el.click();
    }, text);
    await delay(900);
    return true;
  } catch { return false; }
}

async function typeInInput(page, text) {
  await page.evaluate(() => {
    const el = document.querySelector("input[type='text'],input:not([type]),textarea");
    if (el) el.focus();
  });
  await delay(200);
  await page.keyboard.type(text, { delay: 60 });
  await delay(300);
}

async function tap(page, x, y) {
  await page.mouse.click(x, y);
  await delay(800);
}

(async () => {
  console.log("Launching Chromium…");
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-web-security"],
    headless: "new",
  });

  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
  page.on("console", () => {});
  page.on("pageerror", () => {});

  // ── 1. Splash ──────────────────────────────────────────────────────────────
  console.log("\n── Splash ───────────────────────────────────────────────");
  await page.goto(APP_URL, { waitUntil: "networkidle0", timeout: 30000 });
  await delay(3500);
  await snap(page, "01-splash");

  // Click to advance past intro animation
  await tap(page, W / 2, H / 2);
  await delay(2000);
  await tap(page, W / 2, H / 2);
  await delay(2000);

  // ── 2. Onboarding ─────────────────────────────────────────────────────────
  console.log("\n── Onboarding ───────────────────────────────────────────");

  await snap(page, "02-welcome");
  await clickText(page, "Nice to meet you");

  await snap(page, "03-valueprop-1");
  await clickText(page, "Next");

  await snap(page, "04-valueprop-2");
  await clickText(page, "Next");

  await snap(page, "05-valueprop-3");
  await clickText(page, "Let's go");

  await snap(page, "06-name");
  await typeInInput(page, "Lanna");
  await clickText(page, "Continue");

  await snap(page, "07-personalise");
  // Tap the "None of the above" option (or just Continue if unavailable)
  const tappedNone = await clickText(page, "None of the above", 3000);
  if (!tappedNone) await tap(page, W / 2, H * 0.65);
  await delay(400);
  const continued = await clickText(page, "Continue", 3000);
  if (!continued) await tap(page, W / 2, H * 0.87);

  await snap(page, "08-cycle-length");
  const cycleNext = await clickText(page, "Continue", 3000);
  if (!cycleNext) await tap(page, W / 2, H * 0.87);

  await snap(page, "09-last-period");
  // Try to skip or pick a date
  const skipped = await clickText(page, "Skip for now", 3000);
  if (!skipped) {
    await tap(page, W / 2, H * 0.45);
    await delay(400);
    const cont = await clickText(page, "Continue", 3000);
    if (!cont) await tap(page, W / 2, H * 0.87);
  }
  await delay(2500);

  // ── 3. Main app ───────────────────────────────────────────────────────────
  console.log("\n── Main app ─────────────────────────────────────────────");
  await delay(1500);
  await snap(page, "10-home");

  // Tab bar is at the very bottom — tap each of the 5 tabs
  const tabY = H - 28;
  const tabXs = [
    { x: W * 0.10, label: "11-home-tab" },
    { x: W * 0.30, label: "12-checkin-tab" },
    { x: W * 0.50, label: "13-calendar-tab" },
    { x: W * 0.70, label: "14-learn-tab" },
    { x: W * 0.90, label: "15-profile-tab" },
  ];

  for (const t of tabXs) {
    await tap(page, t.x, tabY);
    await delay(1200);
    await snap(page, t.label);
  }

  // Back to home — open quick log sheet
  await tap(page, W * 0.10, tabY);
  await delay(1000);
  await snap(page, "16-home-with-data");

  // Tap the flow quick-log button
  await tap(page, W * 0.18, H * 0.68);
  await delay(1200);
  await snap(page, "17-quicklog-flow");

  // Dismiss
  await tap(page, W / 2, H * 0.15);
  await delay(800);

  // Tap check-in tab for a full-screen check-in view
  await tap(page, W * 0.30, tabY);
  await delay(1200);
  await snap(page, "18-checkin-full");

  // Profile tab
  await tap(page, W * 0.90, tabY);
  await delay(1200);
  await snap(page, "19-profile-final");

  console.log(`\n✓  Done — screenshots in ${OUT_DIR}\n`);
  await browser.close();
})().catch((e) => { console.error("Error:", e.message); process.exit(1); });
