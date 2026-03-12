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
.stars{
  position:absolute;inset:0;z-index:0;
  background-image:
    radial-gradient(1.2px 1.2px at 8% 12%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 22% 38%, rgba(255,255,255,0.35), transparent),
    radial-gradient(0.8px 0.8px at 45% 8%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 72% 22%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1.2px 1.2px at 88% 55%, rgba(255,255,255,0.35), transparent),
    radial-gradient(0.8px 0.8px at 12% 65%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 55% 78%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1.5px 1.5px at 35% 20%, rgba(255,255,255,0.55), transparent),
    radial-gradient(0.8px 0.8px at 92% 82%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 30% 92%, rgba(255,255,255,0.2), transparent),
    radial-gradient(0.6px 0.6px at 65% 42%, rgba(255,255,255,0.2), transparent),
    radial-gradient(0.8px 0.8px at 78% 68%, rgba(255,255,255,0.25), transparent);
}
.content{position:relative;z-index:1;padding:70px 26px 44px}
h1{
  font-weight:800;font-size:35px;line-height:1.10;
  color:#FFFFFF;letter-spacing:-0.8px;
  margin-bottom:10px;
}
.subtitle{
  font-size:14px;font-weight:400;
  color:rgba(255,255,255,0.45);margin-bottom:36px;letter-spacing:0.2px;
}
.notif{
  background:rgba(255,255,255,0.10);
  backdrop-filter:blur(60px) saturate(1.8);
  -webkit-backdrop-filter:blur(60px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.13);
  border-radius:22px;
  padding:18px 20px;
  margin-bottom:13px;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:6px;
}
.notif-app{
  font-weight:700;font-size:15px;color:#FFFFFF;letter-spacing:-0.1px;
}
.notif-time{
  font-weight:400;font-size:12px;color:rgba(255,255,255,0.38);
}
.notif-body{
  font-weight:400;font-size:14px;line-height:1.5;
  color:rgba(255,255,255,0.80);
}
.glow-orb{
  position:absolute;border-radius:50%;z-index:0;pointer-events:none;
}
`;

const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{background:#0B0618}
.bg-glow{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 55% at 20% 12%, rgba(214,51,166,0.32) 0%, transparent 70%),
    radial-gradient(ellipse 70% 50% at 80% 85%, rgba(106,50,200,0.24) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 55% 45%, rgba(255,47,142,0.10) 0%, transparent 60%);
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>

<div class="glow-orb" style="width:8px;height:8px;background:rgba(255,106,213,0.6);top:58px;left:42px;filter:blur(3px)"></div>
<div class="glow-orb" style="width:6px;height:6px;background:rgba(173,107,255,0.5);top:62px;right:50px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:5px;height:5px;background:rgba(255,106,213,0.4);top:450px;left:14px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:4px;height:4px;background:rgba(173,107,255,0.35);top:620px;right:18px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:6px;height:6px;background:rgba(255,106,213,0.3);top:780px;left:28px;filter:blur(2px)"></div>

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

const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=393,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{background:#060B1C}
.bg-glow{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 55% at 75% 12%, rgba(90,158,207,0.30) 0%, transparent 70%),
    radial-gradient(ellipse 65% 50% at 20% 80%, rgba(106,50,180,0.22) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 50% 50%, rgba(107,163,103,0.10) 0%, transparent 60%);
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>

<div class="glow-orb" style="width:7px;height:7px;background:rgba(90,158,207,0.55);top:58px;left:38px;filter:blur(3px)"></div>
<div class="glow-orb" style="width:5px;height:5px;background:rgba(155,110,198,0.45);top:64px;right:48px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:5px;height:5px;background:rgba(90,158,207,0.35);top:470px;left:12px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:4px;height:4px;background:rgba(107,163,103,0.35);top:640px;right:16px;filter:blur(2px)"></div>
<div class="glow-orb" style="width:6px;height:6px;background:rgba(155,110,198,0.3);top:790px;left:24px;filter:blur(2px)"></div>

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
