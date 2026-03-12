import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

const commonStyles = `
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  min-height:100vh;
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
.content{position:relative;z-index:1;padding:56px 26px 44px}
h1{
  font-weight:800;font-size:36px;line-height:1.12;
  color:#FFFFFF;text-align:center;letter-spacing:-0.8px;
  margin-bottom:10px;
}
.subtitle{
  text-align:center;font-size:13.5px;font-weight:400;
  color:rgba(255,255,255,0.48);margin-bottom:32px;letter-spacing:0.2px;
}
.notif{
  background:rgba(255,255,255,0.10);
  backdrop-filter:blur(60px) saturate(1.8);
  -webkit-backdrop-filter:blur(60px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.14);
  border-radius:22px;
  padding:18px 20px;
  margin-bottom:12px;
}
.notif-header{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:7px;
}
.notif-app{
  font-weight:700;font-size:14.5px;color:#FFFFFF;letter-spacing:-0.1px;
}
.notif-time{
  font-weight:400;font-size:12px;color:rgba(255,255,255,0.4);
}
.notif-body{
  font-weight:400;font-size:14px;line-height:1.55;
  color:rgba(255,255,255,0.82);
}
.glow-dot{
  position:absolute;border-radius:50%;filter:blur(1px);z-index:1;
}
`;

const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{background:#08061A}
.bg-glow{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 55% at 25% 15%, rgba(214,51,166,0.30) 0%, transparent 70%),
    radial-gradient(ellipse 65% 45% at 75% 80%, rgba(106,60,200,0.22) 0%, transparent 70%),
    radial-gradient(ellipse 45% 35% at 50% 45%, rgba(255,47,142,0.12) 0%, transparent 65%);
}
.emoji-float{
  font-family:'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif;
  position:absolute;z-index:1;
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>

<span class="emoji-float" style="top:42px;left:28px;font-size:36px;opacity:0.9;transform:rotate(-12deg)">&#x1F338;</span>
<span class="emoji-float" style="top:50px;right:38px;font-size:28px;opacity:0.8;transform:rotate(15deg)">&#x1F349;</span>
<span class="emoji-float" style="top:195px;right:30px;font-size:26px;opacity:0.7;transform:rotate(-8deg)">&#x2728;</span>
<span class="emoji-float" style="top:188px;left:60px;font-size:24px;opacity:0.75;transform:rotate(10deg)">&#x1F35F;</span>

<div class="glow-dot" style="width:6px;height:6px;background:#FF6AD5;top:300px;left:15px;opacity:0.6"></div>
<div class="glow-dot" style="width:4px;height:4px;background:#AD6BFF;top:500px;right:20px;opacity:0.5"></div>
<div class="glow-dot" style="width:5px;height:5px;background:#FF6AD5;top:700px;left:30px;opacity:0.4"></div>

<div class="content">
  <div style="height:72px"></div>
  <h1>Notifications that empower you</h1>
  <p class="subtitle">Warm, witty &amp; unapologetically woman-first</p>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Heads up, love &#x2014; your period is about 2 days away. Time to stock the snack drawer and give yourself full permission to cancel plans.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">Main character season &#x1F33B; Oestrogen is rising and so are you. This is your window for bold lipstick and that thing you've been putting off.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Monday</span></div>
    <div class="notif-body">Internal Affairs Bureau &#x1F49C; Cravings are valid. Tears are valid. Not wanting to be around people? Also valid. Curl up.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Have you had water today? Not coffee. Not rooibos. Actual water. Your cramps will thank you later. Go on, queen &#x1F4A7;</div>
  </div>
</div>
</body></html>`;

const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet">
<style>
${commonStyles}
body{background:#060A1A}
.bg-glow{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 75% 50% at 70% 18%, rgba(90,158,207,0.28) 0%, transparent 70%),
    radial-gradient(ellipse 60% 45% at 25% 75%, rgba(106,60,180,0.20) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 50% 50%, rgba(107,163,103,0.10) 0%, transparent 65%);
}
.emoji-float{
  font-family:'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif;
  position:absolute;z-index:1;
}
</style></head><body>
<div class="bg-glow"></div>
<div class="stars"></div>

<span class="emoji-float" style="top:42px;left:32px;font-size:34px;opacity:0.9;transform:rotate(-10deg)">&#x1F49A;</span>
<span class="emoji-float" style="top:48px;right:36px;font-size:28px;opacity:0.8;transform:rotate(12deg)">&#x2615;</span>
<span class="emoji-float" style="top:192px;right:28px;font-size:24px;opacity:0.7;transform:rotate(-6deg)">&#x1F31E;</span>
<span class="emoji-float" style="top:185px;left:55px;font-size:26px;opacity:0.75;transform:rotate(8deg)">&#x1F49C;</span>

<div class="glow-dot" style="width:5px;height:5px;background:#5A9ECF;top:320px;left:12px;opacity:0.5"></div>
<div class="glow-dot" style="width:4px;height:4px;background:#6BA367;top:520px;right:18px;opacity:0.45"></div>
<div class="glow-dot" style="width:5px;height:5px;background:#9B6EC6;top:710px;left:25px;opacity:0.4"></div>

<div class="content">
  <div style="height:72px"></div>
  <h1>Keep her partner in the loop</h1>
  <p class="subtitle">Empathy nudges &#x2014; no cycle details shared</p>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Now</span></div>
    <div class="notif-body">Tea o'clock &#x2615; Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Yesterday</span></div>
    <div class="notif-body">She is in her element &#x1F31E; Great time for plans, adventures or that conversation you have been saving. Match her energy.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Tuesday</span></div>
    <div class="notif-body">Tenderness window &#x1F90E; Things may feel more intense for her right now. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  </div>

  <div class="notif">
    <div class="notif-header"><span class="notif-app">Olanna Health</span><span class="notif-time">Sunday</span></div>
    <div class="notif-body">Space is love, too &#x1F49C; She may want time alone &#x2014; and it is not about you. Respecting her boundaries is one of the kindest things you can do.</div>
  </div>
</div>
</body></html>`;

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
    args: ['--font-render-hinting=none']
  });

  // Her
  const ctx1 = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page1 = await ctx1.newPage();
  await page1.setContent(herHTML, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(2500);
  await page1.screenshot({ path: `${OUT}/appstore_notif_her.png` });
  console.log('Saved: appstore_notif_her.png');
  await ctx1.close();

  // Partner
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
