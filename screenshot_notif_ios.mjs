import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

// Load app icon as base64
const iconBuf = fs.readFileSync('/home/runner/workspace/client/assets/images/olanna-icon.png');
const iconB64 = `data:image/png;base64,${iconBuf.toString('base64')}`;

const commonStyles = `
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',sans-serif;
  height:852px;width:393px;
  overflow:hidden;
  position:relative;
}
.content{position:relative;z-index:1;padding:52px 24px 44px}
h1{
  font-family:'Poppins',sans-serif;
  font-weight:800;font-size:34px;line-height:1.10;
  color:#FFFFFF;
  letter-spacing:-0.8px;
  margin-bottom:8px;
  text-shadow:0 2px 12px rgba(0,0,0,0.10);
}
.subtitle{
  font-family:'Poppins',sans-serif;
  font-size:13.5px;font-weight:400;
  margin-bottom:32px;letter-spacing:0.2px;
}

/* iOS-style push notification */
.notif{
  position:relative;
  border-radius:20px;
  padding:14px 16px 14px 16px;
  margin-bottom:10px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  gap:4px;
}
/* Top row: icon + app name + time */
.notif-top{
  display:flex;
  align-items:center;
  gap:7px;
  margin-bottom:2px;
}
.notif-icon{
  width:20px;height:20px;
  border-radius:4.5px;
  flex-shrink:0;
}
.notif-app{
  font-size:13px;
  font-weight:600;
  letter-spacing:-0.1px;
  flex:1;
}
.notif-time{
  font-size:12px;
  font-weight:400;
}
/* Title line */
.notif-title{
  font-size:15px;
  font-weight:600;
  letter-spacing:-0.2px;
  line-height:1.3;
}
/* Body */
.notif-body{
  font-size:14px;
  font-weight:400;
  line-height:1.42;
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
    radial-gradient(ellipse 55% 35% at 25% 18%, rgba(255,255,255,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 75% 85%, rgba(255,255,255,0.08) 0%, transparent 60%);
}
.subtitle{color:rgba(255,255,255,0.72)}

.notif{
  background: rgba(255,255,255,0.42);
  backdrop-filter: blur(40px) saturate(1.8);
  -webkit-backdrop-filter: blur(40px) saturate(1.8);
  border: 0.5px solid rgba(255,255,255,0.50);
  box-shadow:
    0 1px 6px rgba(180,80,120,0.08),
    0 6px 20px rgba(180,80,120,0.05),
    inset 0 0.5px 0 rgba(255,255,255,0.65);
}
.notif-app{color:rgba(61,43,61,0.55)}
.notif-time{color:rgba(61,43,61,0.38)}
.notif-title{color:#2D1F2D}
.notif-body{color:rgba(45,31,45,0.82)}
</style></head><body>
<div class="content">
  <h1>Notifications<br>that empower<br>you</h1>
  <p class="subtitle">Warm, witty &amp; unapologetically woman-first</p>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">now</span>
    </div>
    <div class="notif-title">Heads up, love</div>
    <div class="notif-body">Your period is about 2 days away. Time to stock the snack drawer and give yourself full permission to cancel plans.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">1h ago</span>
    </div>
    <div class="notif-title">Main character season</div>
    <div class="notif-body">Oestrogen is rising and so are you. Bold lipstick, big ideas — this is your window. Go get it.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">Monday</span>
    </div>
    <div class="notif-title">Internal Affairs Bureau</div>
    <div class="notif-body">Cravings are valid. Tears are valid. Not wanting to be around people? Also valid. Curl up — you've earned it.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">Sunday</span>
    </div>
    <div class="notif-title">Gentle reminder</div>
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
    radial-gradient(ellipse 55% 35% at 30% 20%, rgba(255,255,255,0.14) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 60%);
}
.subtitle{color:rgba(255,255,255,0.68)}

.notif{
  background: rgba(255,255,255,0.42);
  backdrop-filter: blur(40px) saturate(1.8);
  -webkit-backdrop-filter: blur(40px) saturate(1.8);
  border: 0.5px solid rgba(255,255,255,0.50);
  box-shadow:
    0 1px 6px rgba(100,80,160,0.08),
    0 6px 20px rgba(100,80,160,0.05),
    inset 0 0.5px 0 rgba(255,255,255,0.65);
}
.notif-app{color:rgba(45,42,61,0.55)}
.notif-time{color:rgba(45,42,61,0.38)}
.notif-title{color:#1F1F3D}
.notif-body{color:rgba(35,30,55,0.82)}
</style></head><body>
<div class="content">
  <h1>Keep her<br>partner in<br>the loop</h1>
  <p class="subtitle">Empathy nudges — no cycle details shared</p>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">now</span>
    </div>
    <div class="notif-title">Tea o'clock</div>
    <div class="notif-body">Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">1h ago</span>
    </div>
    <div class="notif-title">She is in her element</div>
    <div class="notif-body">Great time for plans, adventures or that conversation you have been saving. Match her energy.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">Tuesday</span>
    </div>
    <div class="notif-title">Tenderness window</div>
    <div class="notif-body">Things may feel more intense for her right now. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  </div>

  <div class="notif">
    <div class="notif-top">
      <img class="notif-icon" src="${iconB64}" alt="">
      <span class="notif-app">OLANNA HEALTH</span>
      <span class="notif-time">Sunday</span>
    </div>
    <div class="notif-title">Space is love, too</div>
    <div class="notif-body">She may want time alone — and it is not about you. Respecting her boundaries is the kindest thing you can do.</div>
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
