import { chromium } from 'playwright';

const OUT = '/home/runner/workspace/attached_assets';
const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';

const herHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  background:linear-gradient(165deg,#FFF5F7 0%,#FBF0F4 35%,#F3EAF5 65%,#EDE8F6 100%);
  min-height:100vh;
  padding:52px 20px 40px;
  color:#3D2B3D;
}
.header{text-align:center;margin-bottom:32px}
.header h1{font-weight:700;font-size:22px;color:#3D2B3D;letter-spacing:-0.3px;margin-bottom:4px}
.header p{font-weight:300;font-size:12px;color:#8A6D8A;letter-spacing:0.2px}
.card{
  position:relative;
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(20px) saturate(1.4);
  border:1px solid rgba(255,255,255,0.85);
  border-radius:20px;
  padding:20px 20px 16px;
  display:flex;flex-direction:column;gap:10px;
  margin-bottom:14px;
  box-shadow:0 2px 8px rgba(180,142,180,0.08),0 8px 24px rgba(180,142,180,0.06),inset 0 1px 0 rgba(255,255,255,0.9);
}
.card-top{display:flex;align-items:center;gap:12px}
.icon-wrap{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 -1px 2px rgba(0,0,0,0.04)}
.icon-pink{background:linear-gradient(135deg,#FDDDE6,#F8C4D4)}
.icon-rose{background:linear-gradient(135deg,#F6D0D0,#EDAFAF)}
.icon-lilac{background:linear-gradient(135deg,#E8DAFB,#D5C3F0)}
.icon-peach{background:linear-gradient(135deg,#FDE8D8,#F8D4B8)}
.icon-lavender{background:linear-gradient(135deg,#E0D4F0,#CDB8E6)}
.icon-blue{background:linear-gradient(135deg,#D6EAF8,#BDD8F0)}
.icon-sage{background:linear-gradient(135deg,#DDE8DC,#C5D9C2)}
.icon-cream{background:linear-gradient(135deg,#F8EDD8,#F0DFC0)}
.card-headline{font-weight:600;font-size:14px;color:#3D2B3D;line-height:1.35}
.card-body{font-weight:400;font-size:12.5px;line-height:1.6;color:#6B5070}
.card-action{
  align-self:flex-start;display:inline-flex;align-items:center;gap:4px;
  font-weight:600;font-size:11px;letter-spacing:0.3px;
  padding:7px 14px;border-radius:100px;border:none;cursor:pointer;
  font-family:'Poppins',sans-serif;
}
.action-pink{background:#E83E8C;color:#fff}
.action-rose{background:#D46B6B;color:#fff}
.action-lilac{background:#9B6EC6;color:#fff}
.action-peach{background:#E8885A;color:#fff}
.action-soft{background:rgba(232,62,140,0.12);color:#C22E6E}
.action-blue{background:#5A9ECF;color:#fff}
.action-sage{background:#6BA367;color:#fff}
.card-tag{
  position:absolute;top:12px;right:14px;
  font-weight:500;font-size:9px;letter-spacing:1px;text-transform:uppercase;
  padding:3px 8px;border-radius:100px;
}
.tag-phase{background:rgba(232,62,140,0.10);color:#C22E6E}
.tag-ritual{background:rgba(155,110,198,0.10);color:#7B54A3}
.tag-care{background:rgba(107,163,103,0.10);color:#4E8A4A}
.arrow::after{content:" →"}
</style></head><body>
<div class="header">
  <h1>For Her</h1>
  <p>Push notifications from Olanna Health</p>
</div>

<div class="card">
  <span class="card-tag tag-phase">Cycle</span>
  <div class="card-top"><div class="icon-wrap icon-pink">🌸</div><div class="card-headline">Heads up, love</div></div>
  <div class="card-body">Your period is about 2 days away. Time to stock the snack drawer, queue the playlist and give yourself full permission to cancel plans.</div>
  <button class="card-action action-pink arrow">View cycle</button>
</div>

<div class="card">
  <span class="card-tag tag-ritual">Rest</span>
  <div class="card-top"><div class="icon-wrap icon-rose">☕</div><div class="card-headline">Day 1 energy report</div></div>
  <div class="card-body">Your body is doing the most right now. Honour it. A warm drink, a slow morning, and absolutely zero guilt for saying "not today."</div>
  <button class="card-action action-rose arrow">Log how you feel</button>
</div>

<div class="card">
  <span class="card-tag tag-phase">Follicular</span>
  <div class="card-top"><div class="icon-wrap icon-lilac">🌻</div><div class="card-headline">Main character season</div></div>
  <div class="card-body">Oestrogen is rising and so are you. This is your window for new ideas, bold lipstick and that thing you have been putting off. Go get it.</div>
  <button class="card-action action-lilac arrow">Explore phase tips</button>
</div>

<div class="card">
  <span class="card-tag tag-phase">Ovulation</span>
  <div class="card-top"><div class="icon-wrap icon-peach">🌞</div><div class="card-headline">You are literally glowing</div></div>
  <div class="card-body">Peak energy, peak confidence, peak skin. Whatever you have been meaning to say or do — this is the week.</div>
  <button class="card-action action-peach arrow">Open app</button>
</div>

<div class="card">
  <span class="card-tag tag-care">Self-care</span>
  <div class="card-top"><div class="icon-wrap icon-lavender">💜</div><div class="card-headline">Internal Affairs Bureau</div></div>
  <div class="card-body">This is your luteal phase speaking. Cravings are valid. Tears are valid. Not wanting to be around people? Also valid.</div>
  <button class="card-action action-soft arrow">Check PMS score</button>
</div>

<div class="card">
  <span class="card-tag tag-ritual">Ritual</span>
  <div class="card-top"><div class="icon-wrap icon-blue">💧</div><div class="card-headline">Gentle reminder</div></div>
  <div class="card-body">Have you had water today? Not coffee. Not rooibos. Actual water. Your cramps will thank you later. Go on, queen.</div>
  <button class="card-action action-blue">Noted, thanks</button>
</div>

<div class="card">
  <span class="card-tag tag-care">Check-in</span>
  <div class="card-top"><div class="icon-wrap icon-sage">🍃</div><div class="card-headline">You are whole, just as you are</div></div>
  <div class="card-body">Quick reminder that your worth is not measured by a relationship status, a ring, or anyone else's timeline. You are the main event.</div>
  <button class="card-action action-sage arrow">Daily check-in</button>
</div>

<div class="card">
  <span class="card-tag tag-phase">Fertility</span>
  <div class="card-top"><div class="icon-wrap icon-cream">🌼</div><div class="card-headline">Fertile window is open</div></div>
  <div class="card-body">Your fertile window starts today and lasts roughly 5 days. Whether you are planning or protecting, knowledge is your superpower.</div>
  <button class="card-action action-pink arrow">View fertile days</button>
</div>

</body></html>`;

const partnerHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Poppins',system-ui,sans-serif;
  background:linear-gradient(165deg,#EDE8F6 0%,#F0EAF8 35%,#F3EDF5 65%,#FFF5F7 100%);
  min-height:100vh;
  padding:52px 20px 40px;
  color:#3D2B3D;
}
.header{text-align:center;margin-bottom:32px}
.header h1{font-weight:700;font-size:22px;color:#3D2B3D;letter-spacing:-0.3px;margin-bottom:4px}
.header p{font-weight:300;font-size:12px;color:#8A6D8A;letter-spacing:0.2px}
.privacy-note{
  text-align:center;font-size:10px;font-weight:400;color:#B48EB4;
  margin-bottom:24px;padding:0 10px;line-height:1.5;
}
.card{
  position:relative;
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(20px) saturate(1.4);
  border:1px solid rgba(255,255,255,0.85);
  border-radius:20px;
  padding:20px 20px 16px;
  display:flex;flex-direction:column;gap:10px;
  margin-bottom:14px;
  box-shadow:0 2px 8px rgba(180,142,180,0.08),0 8px 24px rgba(180,142,180,0.06),inset 0 1px 0 rgba(255,255,255,0.9);
}
.card-top{display:flex;align-items:center;gap:12px}
.icon-wrap{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 -1px 2px rgba(0,0,0,0.04)}
.icon-blue{background:linear-gradient(135deg,#D6EAF8,#BDD8F0)}
.icon-lilac{background:linear-gradient(135deg,#E8DAFB,#D5C3F0)}
.icon-peach{background:linear-gradient(135deg,#FDE8D8,#F8D4B8)}
.icon-pink{background:linear-gradient(135deg,#FDDDE6,#F8C4D4)}
.icon-sage{background:linear-gradient(135deg,#DDE8DC,#C5D9C2)}
.icon-lavender{background:linear-gradient(135deg,#E0D4F0,#CDB8E6)}
.card-headline{font-weight:600;font-size:14px;color:#3D2B3D;line-height:1.35}
.card-body{font-weight:400;font-size:12.5px;line-height:1.6;color:#6B5070}
.card-action{
  align-self:flex-start;display:inline-flex;align-items:center;gap:4px;
  font-weight:600;font-size:11px;letter-spacing:0.3px;
  padding:7px 14px;border-radius:100px;border:none;cursor:pointer;
  font-family:'Poppins',sans-serif;
}
.action-blue{background:#5A9ECF;color:#fff}
.action-lilac{background:#9B6EC6;color:#fff}
.action-peach{background:#E8885A;color:#fff}
.action-pink{background:#E83E8C;color:#fff}
.action-sage{background:#6BA367;color:#fff}
.action-soft{background:rgba(232,62,140,0.12);color:#C22E6E}
.card-tag{
  position:absolute;top:12px;right:14px;
  font-weight:500;font-size:9px;letter-spacing:1px;text-transform:uppercase;
  padding:3px 8px;border-radius:100px;
  background:rgba(90,158,207,0.10);color:#3D7FAF;
}
.arrow::after{content:" →"}
.footer{
  text-align:center;font-size:11px;font-weight:300;color:#B48EB4;
  margin-top:20px;line-height:1.6;max-width:320px;margin-left:auto;margin-right:auto;
}
</style></head><body>
<div class="header">
  <h1>For Her Partner</h1>
  <p>Supportive nudges from Olanna Health</p>
</div>
<div class="privacy-note">Partner notifications never expose cycle details — just enough context to encourage empathy.</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-blue">🍵</div><div class="card-headline">Tea o'clock</div></div>
  <div class="card-body">Her cycle is shifting this week. A warm drink, fewer questions and a little extra patience go a long way. You do not need details — just be present.</div>
  <button class="card-action action-blue arrow">Supportive ideas</button>
</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-lilac">💤</div><div class="card-headline">Low-key energy ahead</div></div>
  <div class="card-body">She might need more rest over the next few days. Maybe handle dinner, skip the pep talk, and let her set the pace. Quiet support speaks volumes.</div>
  <button class="card-action action-lilac">Got it</button>
</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-peach">🌞</div><div class="card-headline">She is in her element</div></div>
  <div class="card-body">Great time for plans, adventures or that conversation you have been saving. Her energy is up — match it with something thoughtful.</div>
  <button class="card-action action-peach arrow">Open app</button>
</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-pink">🤎</div><div class="card-headline">Tenderness window</div></div>
  <div class="card-body">Things may feel a bit more intense for her right now — and that is completely normal. No fixing needed. Just warmth, snacks, and zero judgment.</div>
  <button class="card-action action-pink arrow">Read more</button>
</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-sage">💚</div><div class="card-headline">Small gestures, big impact</div></div>
  <div class="card-body">You do not need to understand every hormone to be supportive. Showing up consistently matters more than grand gestures. You are doing great.</div>
  <button class="card-action action-sage">Thanks, Olanna</button>
</div>

<div class="card">
  <span class="card-tag">Partner</span>
  <div class="card-top"><div class="icon-wrap icon-lavender">💜</div><div class="card-headline">Space is love, too</div></div>
  <div class="card-body">She may want time alone — and it is not about you. Respecting her boundaries without taking it personally is one of the kindest things you can do.</div>
  <button class="card-action action-soft">Understood</button>
</div>

</body></html>`;

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM_PATH });

  // Her notifications - full page screenshot
  const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const page1 = await ctx1.newPage();
  await page1.setContent(herHTML, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1500);
  await page1.screenshot({ path: `${OUT}/notif_for_her.png`, fullPage: true });
  console.log('Saved: notif_for_her.png');
  await ctx1.close();

  // Partner notifications - full page screenshot
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const page2 = await ctx2.newPage();
  await page2.setContent(partnerHTML, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1500);
  await page2.screenshot({ path: `${OUT}/notif_for_partner.png`, fullPage: true });
  console.log('Saved: notif_for_partner.png');
  await ctx2.close();

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error(e.message); process.exit(1); });
