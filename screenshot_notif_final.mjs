import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

const commonStyles = `
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  height:852px;width:393px;
  overflow:hidden;
  position:relative;
}
.content{position:relative;z-index:1;padding:68px 24px 44px}
h1{
  font-weight:800;font-size:35px;line-height:1.10;
  letter-spacing:-0.8px;
  margin-bottom:10px;
}
.subtitle{
  font-size:14px;font-weight:400;
  margin-bottom:34px;letter-spacing:0.2px;
}

/* iOS Liquid Glass notification card */
.notif{
  position:relative;
  border-radius:22px;
  padding:18px 20px;
  margin-bottom:13px;
  overflow:hidden;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:6px;
}
.notif-app{
  font-weight:700;font-size:15px;letter-spacing:-0.1px;
}
.notif-time{
  font-weight:400;font-size:12px;
}
.notif-body{
  font-weight:400;font-size:14px;line-height:1.52;
}
/* Top highlight stripe for glass refraction effect */
.notif::before{
  content:'';
  position:absolute;
  top:0;left:10%;right:10%;
  height:1px;
  border-radius:1px;
}
`;

// LIGHT MODE — "For Her" with brand gradient background
const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{
  background: linear-gradient(155deg, #F7A37A 0%, #E85A9C 45%, #D070A0 75%, #C060A0 100%);
}
/* Subtle noise/texture overlay */
body::before{
  content:'';position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 70% 80%, rgba(255,255,255,0.10) 0%, transparent 60%);
}

h1{color:#FFFFFF;text-shadow:0 1px 8px rgba(0,0,0,0.08)}
.subtitle{color:rgba(255,255,255,0.72)}

/* Liquid Glass — light tint on warm gradient */
.notif{
  background: rgba(255,255,255,0.38);
  backdrop-filter: blur(40px) saturate(1.6);
  -webkit-backdrop-filter: blur(40px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow:
    0 2px 12px rgba(180,80,120,0.10),
    0 8px 28px rgba(180,80,120,0.07),
    inset 0 1px 0 rgba(255,255,255,0.70),
    inset 0 -1px 0 rgba(255,255,255,0.12);
}
.notif::before{
  background:rgba(255,255,255,0.70);
}
.notif-app{color:#3D2B3D}
.notif-time{color:rgba(61,43,61,0.45)}
.notif-body{color:#4A3040}
</style></head><body>
<div class="content">
  <h1>Notifications<br>that empower<br>you</h1>
  <p class="subtitle">Warm, witty &amp; unapologetically woman-first</p>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Heads up, love — your period is about 2 days away. Time to stock the snack drawer and give yourself full permission to cancel plans.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">Main character season. Oestrogen is rising and so are you. This is your window for bold lipstick and that thing you've been putting off.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Monday</span></div>
    <div class="notif-body">Internal Affairs Bureau. Cravings are valid. Tears are valid. Not wanting to be around people? Also valid. Curl up.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Have you had water today? Not coffee. Not rooibos. Actual water. Your cramps will thank you later. Go on, queen.</div>
  </div>
</div>
</body></html>`;

// LIGHT MODE — "For Partner" with softer brand gradient
const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{
  background: linear-gradient(155deg, #D070A0 0%, #9B6EC6 40%, #7B8EC6 75%, #5A9ECF 100%);
}
body::before{
  content:'';position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 60% 40% at 35% 25%, rgba(255,255,255,0.15) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 65% 75%, rgba(255,255,255,0.10) 0%, transparent 60%);
}

h1{color:#FFFFFF;text-shadow:0 1px 8px rgba(0,0,0,0.08)}
.subtitle{color:rgba(255,255,255,0.70)}

.notif{
  background: rgba(255,255,255,0.38);
  backdrop-filter: blur(40px) saturate(1.6);
  -webkit-backdrop-filter: blur(40px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow:
    0 2px 12px rgba(120,80,160,0.10),
    0 8px 28px rgba(120,80,160,0.07),
    inset 0 1px 0 rgba(255,255,255,0.70),
    inset 0 -1px 0 rgba(255,255,255,0.12);
}
.notif::before{
  background:rgba(255,255,255,0.70);
}
.notif-app{color:#2D2A3D}
.notif-time{color:rgba(45,42,61,0.45)}
.notif-body{color:#3A3050}
</style></head><body>
<div class="content">
  <h1>Keep her<br>partner in<br>the loop</h1>
  <p class="subtitle">Empathy nudges — no cycle details shared</p>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Tea o'clock. Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">She is in her element. Great time for plans, adventures or that conversation you have been saving. Match her energy.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Tuesday</span></div>
    <div class="notif-body">Tenderness window. Things may feel more intense for her right now. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Space is love, too. She may want time alone — and it is not about you. Respecting her boundaries is one of the kindest things you can do.</div>
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
