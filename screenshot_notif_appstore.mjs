import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  background:#0A0A1A;
  min-height:100vh;
  overflow:hidden;
  position:relative;
}
.bg-glow{
  position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 50% at 30% 20%, rgba(214,51,166,0.25) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 70% 75%, rgba(106,60,180,0.2) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255,106,77,0.1) 0%, transparent 70%);
  z-index:0;
}
.stars{
  position:absolute;inset:0;z-index:0;
  background-image:
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.35), transparent),
    radial-gradient(1px 1px at 75% 30%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 40% 25%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 90% 85%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.2), transparent);
}
.content{position:relative;z-index:1;padding:60px 28px 50px}
.hero-emoji{text-align:center;font-size:42px;margin-bottom:12px}
h1{
  font-weight:800;font-size:34px;line-height:1.15;
  color:#FFFFFF;text-align:center;letter-spacing:-0.5px;
  margin-bottom:8px;
}
.subtitle{
  text-align:center;font-size:13px;font-weight:400;
  color:rgba(255,255,255,0.5);margin-bottom:28px;letter-spacing:0.3px;
}
.float-emoji{
  text-align:center;font-size:32px;margin-bottom:20px;
  display:flex;justify-content:center;gap:16px;
}
.notif{
  background:rgba(255,255,255,0.12);
  backdrop-filter:blur(40px) saturate(1.8);
  -webkit-backdrop-filter:blur(40px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.15);
  border-radius:20px;
  padding:16px 18px;
  margin-bottom:12px;
  position:relative;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:6px;
}
.notif-app{
  font-weight:700;font-size:14px;color:#FFFFFF;
}
.notif-time{
  font-weight:400;font-size:12px;color:rgba(255,255,255,0.45);
}
.notif-body{
  font-weight:400;font-size:13.5px;line-height:1.55;
  color:rgba(255,255,255,0.82);
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>
<div class="content">
  <div class="hero-emoji">🪷</div>
  <h1>Notifications that empower you</h1>
  <p class="subtitle">Warm, witty &amp; unapologetically woman-first</p>
  <div class="float-emoji">🌸 💜 🌞</div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Heads up, love — your period is about 2 days away. Time to stock the snack drawer and give yourself full permission to cancel plans.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">Main character season 🌻 Oestrogen is rising and so are you. This is your window for bold lipstick and that thing you've been putting off.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Monday</span></div>
    <div class="notif-body">Internal Affairs Bureau 💜 Cravings are valid. Tears are valid. Not wanting to be around people? Also valid. Curl up.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Have you had water today? Not coffee. Not rooibos. Actual water. Your cramps will thank you later. Go on, queen. 💧</div>
  </div>
</div>
</body></html>`;

const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  background:#0A0A1A;
  min-height:100vh;
  overflow:hidden;
  position:relative;
}
.bg-glow{
  position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 50% at 70% 25%, rgba(90,158,207,0.25) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 30% 70%, rgba(106,60,180,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 50% 50%, rgba(107,163,103,0.12) 0%, transparent 70%);
  z-index:0;
}
.stars{
  position:absolute;inset:0;z-index:0;
  background-image:
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.35), transparent),
    radial-gradient(1px 1px at 75% 30%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 40% 25%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 90% 85%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.2), transparent);
}
.content{position:relative;z-index:1;padding:60px 28px 50px}
.hero-emoji{text-align:center;font-size:42px;margin-bottom:12px}
h1{
  font-weight:800;font-size:34px;line-height:1.15;
  color:#FFFFFF;text-align:center;letter-spacing:-0.5px;
  margin-bottom:8px;
}
.subtitle{
  text-align:center;font-size:13px;font-weight:400;
  color:rgba(255,255,255,0.5);margin-bottom:28px;letter-spacing:0.3px;
}
.float-emoji{
  text-align:center;font-size:32px;margin-bottom:20px;
  display:flex;justify-content:center;gap:16px;
}
.notif{
  background:rgba(255,255,255,0.12);
  backdrop-filter:blur(40px) saturate(1.8);
  -webkit-backdrop-filter:blur(40px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.15);
  border-radius:20px;
  padding:16px 18px;
  margin-bottom:12px;
  position:relative;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:6px;
}
.notif-app{
  font-weight:700;font-size:14px;color:#FFFFFF;
}
.notif-time{
  font-weight:400;font-size:12px;color:rgba(255,255,255,0.45);
}
.notif-body{
  font-weight:400;font-size:13.5px;line-height:1.55;
  color:rgba(255,255,255,0.82);
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>
<div class="content">
  <div class="hero-emoji">💚</div>
  <h1>Keep her partner in the loop</h1>
  <p class="subtitle">Empathy nudges — no cycle details shared</p>
  <div class="float-emoji">🍵 🌞 💜</div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Tea o'clock 🍵 Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">She is in her element 🌞 Great time for plans, adventures or that conversation you have been saving. Match her energy.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Tuesday</span></div>
    <div class="notif-body">Tenderness window 🤎 Things may feel more intense for her right now. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Space is love, too 💜 She may want time alone — and it is not about you. Respecting her boundaries is one of the kindest things you can do.</div>
  </div>
</div>
</body></html>`;

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });

  // Her - iPhone 15 Pro dimensions
  const ctx1 = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page1 = await ctx1.newPage();
  await page1.setContent(herHTML, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(2000);
  await page1.screenshot({ path: `${OUT}/appstore_notif_her.png` });
  console.log('Saved: appstore_notif_her.png');
  await ctx1.close();

  // Partner
  const ctx2 = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page2 = await ctx2.newPage();
  await page2.setContent(partnerHTML, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2000);
  await page2.screenshot({ path: `${OUT}/appstore_notif_partner.png` });
  console.log('Saved: appstore_notif_partner.png');
  await ctx2.close();

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error(e.message); process.exit(1); });
