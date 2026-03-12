import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

// Convert lotus PNGs to base64 data URIs
const lotusDir = '/home/runner/workspace/client/assets/images';
const lotusB64 = {};
for (const [key, file] of Object.entries({
  menstrual: 'lotus-menstrual.png',
  follicular: 'lotus-follicular.png',
  ovulation: 'lotus-ovulation.png',
  luteal: 'lotus-luteal.png',
})) {
  const buf = fs.readFileSync(path.join(lotusDir, file));
  lotusB64[key] = `data:image/png;base64,${buf.toString('base64')}`;
}

// Also load the app icon
const iconBuf = fs.readFileSync(path.join(lotusDir, 'olanna-icon.png'));
const iconB64 = `data:image/png;base64,${iconBuf.toString('base64')}`;

const commonStyles = `
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  height:852px;width:393px;
  overflow:hidden;
  position:relative;
}
.content{position:relative;z-index:1;padding:48px 24px 44px}
h1{
  font-weight:800;font-size:33px;line-height:1.12;
  color:#FFFFFF;
  letter-spacing:-0.8px;
  margin-bottom:8px;
  text-shadow:0 2px 12px rgba(0,0,0,0.12);
}
.subtitle{
  font-size:13.5px;font-weight:400;
  margin-bottom:22px;letter-spacing:0.2px;
}

/* Lotus phase strip */
.lotus-strip{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:6px;
  margin-bottom:26px;
}
.lotus-item{
  display:flex;flex-direction:column;align-items:center;gap:4px;
}
.lotus-circle{
  width:60px;height:60px;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border:1.5px solid rgba(255,255,255,0.45);
  box-shadow:0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
}
.lotus-circle img{
  width:38px;height:38px;
  object-fit:contain;
}
.lotus-label{
  font-size:9px;
  font-weight:600;
  letter-spacing:0.8px;
  text-transform:uppercase;
  color:rgba(255,255,255,0.75);
}

/* Notification cards */
.notif{
  position:relative;
  border-radius:22px;
  padding:16px 18px;
  margin-bottom:11px;
  overflow:hidden;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:5px;
}
.notif-app-row{
  display:flex;align-items:center;gap:8px;
}
.notif-icon{
  width:22px;height:22px;border-radius:5px;
}
.notif-app{
  font-weight:700;font-size:14px;letter-spacing:-0.1px;
}
.notif-time{
  font-weight:400;font-size:11.5px;
}
.notif-body{
  font-weight:400;font-size:13px;line-height:1.5;
}
.notif::before{
  content:'';
  position:absolute;
  top:0;left:8%;right:8%;
  height:1px;
  border-radius:1px;
}
`;

const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{
  background: linear-gradient(158deg, #F7A37A 0%, #E85A9C 42%, #D070A0 72%, #B868B0 100%);
}
body::before{
  content:'';position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 55% 35% at 25% 18%, rgba(255,255,255,0.20) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 75% 85%, rgba(255,255,255,0.08) 0%, transparent 60%);
}
.subtitle{color:rgba(255,255,255,0.72)}

.lotus-circle{
  background:rgba(255,255,255,0.30);
}

/* Glass notification cards */
.notif{
  background: rgba(255,255,255,0.40);
  backdrop-filter: blur(40px) saturate(1.6);
  -webkit-backdrop-filter: blur(40px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.58);
  box-shadow:
    0 2px 12px rgba(180,80,120,0.10),
    0 8px 28px rgba(180,80,120,0.06),
    inset 0 1px 0 rgba(255,255,255,0.72),
    inset 0 -1px 0 rgba(255,255,255,0.10);
}
.notif::before{background:rgba(255,255,255,0.72)}
.notif-app{color:#3D2B3D}
.notif-time{color:rgba(61,43,61,0.42)}
.notif-body{color:#4A3040}
</style></head><body>
<div class="content">
  <h1>Notifications<br>that empower<br>you</h1>
  <p class="subtitle">Warm, witty &amp; unapologetically woman-first</p>

  <div class="lotus-strip">
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(244,114,182,0.30)">
        <img src="${lotusB64.menstrual}" alt="Bud">
      </div>
      <span class="lotus-label">Bud</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(249,200,224,0.35)">
        <img src="${lotusB64.follicular}" alt="Rising">
      </div>
      <span class="lotus-label">Rising</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(245,158,11,0.25)">
        <img src="${lotusB64.ovulation}" alt="Bloom">
      </div>
      <span class="lotus-label">Bloom</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(216,180,254,0.30)">
        <img src="${lotusB64.luteal}" alt="Closing">
      </div>
      <span class="lotus-label">Closing</span>
    </div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Now</span>
    </div>
    <div class="notif-body">Heads up, love — your period is about 2 days away. Time to stock the snack drawer and give yourself full permission to cancel plans.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Yesterday</span>
    </div>
    <div class="notif-body">Main character season. Oestrogen is rising and so are you. Bold lipstick, big ideas — this is your window.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Monday</span>
    </div>
    <div class="notif-body">Internal Affairs Bureau. Cravings are valid. Tears are valid. Not wanting to be around people? Also valid.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Sunday</span>
    </div>
    <div class="notif-body">Have you had water today? Not coffee. Not rooibos. Actual water. Your cramps will thank you later.</div>
  </div>
</div>
</body></html>`;

const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{
  background: linear-gradient(158deg, #D070A0 0%, #9B6EC6 38%, #7B8EC6 68%, #5A9ECF 100%);
}
body::before{
  content:'';position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 55% 35% at 30% 20%, rgba(255,255,255,0.16) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 60%);
}
.subtitle{color:rgba(255,255,255,0.68)}

.lotus-circle{
  background:rgba(255,255,255,0.28);
}

.notif{
  background: rgba(255,255,255,0.40);
  backdrop-filter: blur(40px) saturate(1.6);
  -webkit-backdrop-filter: blur(40px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow:
    0 2px 12px rgba(100,80,160,0.10),
    0 8px 28px rgba(100,80,160,0.06),
    inset 0 1px 0 rgba(255,255,255,0.72),
    inset 0 -1px 0 rgba(255,255,255,0.10);
}
.notif::before{background:rgba(255,255,255,0.72)}
.notif-app{color:#2D2A3D}
.notif-time{color:rgba(45,42,61,0.42)}
.notif-body{color:#3A3050}
</style></head><body>
<div class="content">
  <h1>Keep her<br>partner in<br>the loop</h1>
  <p class="subtitle">Empathy nudges — no cycle details shared</p>

  <div class="lotus-strip">
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(244,114,182,0.25)">
        <img src="${lotusB64.menstrual}" alt="Bud">
      </div>
      <span class="lotus-label">Bud</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(249,200,224,0.30)">
        <img src="${lotusB64.follicular}" alt="Rising">
      </div>
      <span class="lotus-label">Rising</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(245,158,11,0.22)">
        <img src="${lotusB64.ovulation}" alt="Bloom">
      </div>
      <span class="lotus-label">Bloom</span>
    </div>
    <div class="lotus-item">
      <div class="lotus-circle" style="background:rgba(216,180,254,0.28)">
        <img src="${lotusB64.luteal}" alt="Closing">
      </div>
      <span class="lotus-label">Closing</span>
    </div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Now</span>
    </div>
    <div class="notif-body">Tea o'clock. Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Yesterday</span>
    </div>
    <div class="notif-body">She is in her element. Great time for plans, adventures or that conversation you have been saving.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Tuesday</span>
    </div>
    <div class="notif-body">Tenderness window. Things may feel more intense for her right now. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  </div>

  <div class="notif">
    <div class="notif-header">
      <div class="notif-app-row">
        <img class="notif-icon" src="${iconB64}" alt="Olanna">
        <span class="notif-app">Olanna Health</span>
      </div>
      <span class="notif-time">Sunday</span>
    </div>
    <div class="notif-body">Space is love, too. She may want time alone — and it is not about you. Respecting her boundaries is the kindest thing you can do.</div>
  </div>
</div>
</body></html>`;

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
    args: ['--font-render-hinting=none']
  });

  const ctx1 = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page1 = await ctx1.newPage();
  await page1.setContent(herHTML, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(2500);
  await page1.screenshot({ path: `${OUT}/appstore_notif_her.png` });
  console.log('Saved: appstore_notif_her.png');
  await ctx1.close();

  const ctx2 = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page2 = await ctx2.newPage();
  await page2.setContent(partnerHTML, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2500);
  await page2.screenshot({ path: `${OUT}/appstore_notif_partner.png` });
  console.log('Saved: appstore_notif_partner.png');
  await ctx2.close();

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error(e.message); process.exit(1); });
