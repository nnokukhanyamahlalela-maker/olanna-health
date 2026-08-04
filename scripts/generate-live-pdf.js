const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const SS = path.join(__dirname, "../screenshots");
const OUT = path.join(__dirname, "../olanna-health-live-preview.pdf");

// A4
const PW = 595.28, PH = 841.89;
const M = 32; // margin

const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
doc.pipe(fs.createWriteStream(OUT));

// ── Helpers ──────────────────────────────────────────────────────────────────

function addPage() { doc.addPage({ size: "A4", margin: 0 }); }

function bg(x = 0, y = 0, w = PW, h = PH) {
  const g = doc.linearGradient(x, y, x + w, y + h);
  g.stop(0, "#FF9A6B").stop(0.33, "#FF3F9E").stop(0.66, "#F7B0C8").stop(1, "#E7C2E8");
  doc.rect(x, y, w, h).fill(g);
}

function pill(x, y, w, h, color) {
  doc.roundedRect(x, y, w, h, h / 2).fill(color);
}

// Draw a phone with the screenshot inside it
function phone(imgFile, cx, y, phoneW, phoneH) {
  const R = 20;
  const x = cx - phoneW / 2;
  // subtle shadow
  doc.roundedRect(x + 2, y + 3, phoneW, phoneH, R).fill("#00000015");
  // white phone body
  doc.roundedRect(x, y, phoneW, phoneH, R).lineWidth(1).strokeColor("#E8E0E8").fillColor("#FFFFFF").fillAndStroke();
  // image clipped inside
  const file = path.join(SS, imgFile);
  if (fs.existsSync(file)) {
    doc.save();
    doc.roundedRect(x + 1, y + 1, phoneW - 2, phoneH - 2, R - 1).clip();
    doc.image(file, x + 1, y + 1, { width: phoneW - 2, height: phoneH - 2, cover: [phoneW - 2, phoneH - 2], align: "center", valign: "top" });
    doc.restore();
  }
}

function label(text, cx, y, color = "#5A4252") {
  doc.fillColor(color).font("Helvetica").fontSize(8)
    .text(text, cx - 60, y, { width: 120, align: "center" });
}

function sectionTitle(title, sub) {
  // gradient banner at top
  bg(0, 0, PW, 100);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22)
    .text(title, M, 30, { width: PW - M * 2 });
  if (sub) {
    doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.85)")
      .text(sub, M, 58, { width: PW - M * 2 });
  }
}

// ── COVER ────────────────────────────────────────────────────────────────────
addPage();
bg();

// Splash screenshot centred on cover
const coverW = 200, coverH = 400;
const coverX = (PW - coverW) / 2;
const coverY = 140;
phone("01-splash.png", PW / 2, coverY, coverW, coverH);

doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(32)
  .text("OLANNA", 0, coverY + coverH + 36, { align: "center", characterSpacing: 6 });
doc.font("Helvetica").fontSize(13).fillColor("rgba(255,255,255,0.8)")
  .text("H E A L T H", 0, coverY + coverH + 72, { align: "center", characterSpacing: 8 });
doc.fontSize(10).fillColor("rgba(255,255,255,0.6)")
  .text("Live build preview  ·  Lanna Period Tracker v2", 0, coverY + coverH + 100, { align: "center" });
doc.fontSize(8).fillColor("rgba(255,255,255,0.4)")
  .text("Confidential", 0, PH - 44, { align: "center" });

// ── PAGE 1 — ONBOARDING (Welcome + Value Props) ───────────────────────────────
addPage();
sectionTitle("Onboarding — Introduction", "Welcome screen, Lanna mascot, and three value-prop slides");

const PH_W = 108, PH_H = 216;
const row1y = 118;

const row1 = [
  { f: "02-welcome.png",      lbl: "Welcome — Hi, I'm Lanna" },
  { f: "03-valueprop-1.png",  lbl: "Meet your four phases" },
  { f: "04-valueprop-2.png",  lbl: "Know yourself better" },
  { f: "05-valueprop-3.png",  lbl: "Built for PMOS support" },
];

const gap1 = (PW - M * 2 - PH_W * 4) / 3;
row1.forEach((s, i) => {
  const cx = M + PH_W / 2 + i * (PH_W + gap1);
  phone(s.f, cx, row1y, PH_W, PH_H);
  label(s.lbl, cx, row1y + PH_H + 6);
});

// Callout box
const boxY = row1y + PH_H + 28;
doc.roundedRect(M, boxY, PW - M * 2, 72, 10).fill("#FDF5F8");
doc.fillColor("#A84B6C").font("Helvetica-Bold").fontSize(10)
  .text("Brand voice — zero guilt, companion tone", M + 14, boxY + 12, { width: PW - M * 2 - 28 });
doc.fillColor("#5A4252").font("Helvetica").fontSize(9)
  .text(
    '"Hi, I\'m Lanna. I\'ll be walking alongside you, phase by phase, day by day."  ·  ' +
    '"Meet your four phases — each comes with its own mood, tips and a little companion."  ·  ' +
    '"Know yourself better — reveal patterns only you could discover."',
    M + 14, boxY + 28, { width: PW - M * 2 - 28, lineGap: 2 }
  );

// ── PAGE 2 — ONBOARDING (Setup steps) ────────────────────────────────────────
addPage();
sectionTitle("Onboarding — Setup", "Name, personalise, cycle length, and last period date");

const row2 = [
  { f: "06-name.png",         lbl: "Name entry" },
  { f: "07-personalise.png",  lbl: "Personalise" },
  { f: "11-home-tab.png",     lbl: "Cycle length" },
  { f: "12-checkin-tab.png",  lbl: "Last period date" },
];

row2.forEach((s, i) => {
  const cx = M + PH_W / 2 + i * (PH_W + gap1);
  phone(s.f, cx, row1y, PH_W, PH_H);
  label(s.lbl, cx, row1y + PH_H + 6);
});

const b2Y = row1y + PH_H + 28;
doc.roundedRect(M, b2Y, PW - M * 2, 72, 10).fill("#FDF5F8");
doc.fillColor("#A84B6C").font("Helvetica-Bold").fontSize(10)
  .text("Low-pressure copy throughout", M + 14, b2Y + 12);
doc.fillColor("#5A4252").font("Helvetica").fontSize(9)
  .text(
    '"Just your first name is perfect."  ·  "Does any of this apply? You can always change this later."  ·  ' +
    '"Most cycles are 24–35 days. Not sure? 28 is a great starting point."  ·  ' +
    '"This helps me get your cycle right from day one."',
    M + 14, b2Y + 28, { width: PW - M * 2 - 28, lineGap: 2 }
  );

// ── PAGE 3 — HOME (Lotus Cycle) ───────────────────────────────────────────────
addPage();
sectionTitle("Home — Lotus Cycle Wheel", "Phase-aware home screen with mascot, quick-log row, and phase guidance card");

// Large centred phone
const bigW = 188, bigH = 375;
phone("17-quicklog-flow.png", PW / 2, 112, bigW, bigH);

// Annotations
const annoY = 112;
const annoX = M;
const annoRX = PW - M - 140;

doc.fillColor("#A84B6C").font("Helvetica-Bold").fontSize(8.5);

// Left side annotations
const left = [
  { y: annoY + 10,  t: "Lanna greeting" },
  { y: annoY + 65,  t: "Lotus cycle wheel" },
  { y: annoY + 175, t: "Phase name & tag" },
  { y: annoY + 215, t: "Phase guidance card" },
  { y: annoY + 285, t: "Quick-log row" },
];
left.forEach((a) => {
  doc.text("→", annoX, a.y);
  doc.fillColor("#5A4252").font("Helvetica").fontSize(8).text(a.t, annoX + 14, a.y, { width: 90 });
  doc.fillColor("#A84B6C").font("Helvetica-Bold").fontSize(8.5);
});

const right = [
  { y: annoY + 50,  t: "Day in cycle" },
  { y: annoY + 305, t: "Phase colour dots" },
  { y: annoY + 335, t: "Flow · Mood · Pain · Energy" },
];
right.forEach((a) => {
  doc.fillColor("#A84B6C").font("Helvetica-Bold").fontSize(8.5).text("←", annoRX + 126, a.y);
  doc.fillColor("#5A4252").font("Helvetica").fontSize(8).text(a.t, annoRX, a.y, { width: 118, align: "right" });
});

// Phase colour strip
const stripY = 112 + bigH + 22;
const phases = [
  { name: "Menstrual",  color: "#F06B9A" },
  { name: "Follicular", color: "#D178B3" },
  { name: "Ovulatory",  color: "#DE73DE" },
  { name: "Luteal",     color: "#C9A0DC" },
];
const sw = (PW - M * 2) / 4;
phases.forEach((p, i) => {
  const sx = M + i * sw;
  doc.roundedRect(sx + 8, stripY, sw - 16, 14, 4).fill(p.color);
  doc.fillColor("#5A4252").font("Helvetica").fontSize(7.5)
    .text(p.name, sx, stripY + 18, { width: sw, align: "center" });
  doc.fillColor("#8A6F80").fontSize(7).text(p.color, sx, stripY + 28, { width: sw, align: "center" });
});

// ── PAGE 4 — CALENDAR & HEALTH ─────────────────────────────────────────────
addPage();
sectionTitle("Calendar & Health Insights", "Phase-coded calendar with daily card, and health patterns with mood/sleep charts");

const twoW = 196, twoH = 392;
const gap2 = PW - M * 2 - twoW * 2;

phone("18-checkin-full.png", M + twoW / 2, 112, twoW, twoH);
label("Calendar — phase-coded", M + twoW / 2, 112 + twoH + 6, "#5A4252");

phone("14-learn-tab.png", M + twoW + gap2 + twoW / 2, 112, twoW, twoH);
label("Health — patterns & charts", M + twoW + gap2 + twoW / 2, 112 + twoH + 6, "#5A4252");

// note strip
const n4Y = 112 + twoH + 26;
doc.roundedRect(M, n4Y, PW - M * 2, 56, 8).fill("#FDF5F8");
doc.fillColor("#5A4252").font("Helvetica").fontSize(9)
  .text(
    "Calendar: days colour-coded by cycle phase. Tap any day to log or review. Daily card shows Lanna with phase name and a Log this day CTA.\n" +
    "Health: symptom patterns surfaced automatically (e.g. Fatigue and cravings cluster — shown up together 4 times this month), sleep chart, and mood-across-cycle line graph.",
    M + 14, n4Y + 10, { width: PW - M * 2 - 28, lineGap: 3 }
  );

// ── PAGE 5 — LEARN & CHECK-IN ──────────────────────────────────────────────
addPage();
sectionTitle("Learn & Check-In", "Curated article library and full symptom check-in");

phone("15-profile-tab.png", M + twoW / 2, 112, twoW, twoH);
label("Learn — articles by topic", M + twoW / 2, 112 + twoH + 6, "#5A4252");

// For checkin, try screenshot_checkin or fallback to 13-calendar-tab
const checkinFile = fs.existsSync(path.join(SS, "screenshot_checkin.png"))
  ? "screenshot_checkin.png" : "13-calendar-tab.png";
phone(checkinFile, M + twoW + gap2 + twoW / 2, 112, twoW, twoH);
label("Check-In — symptom grid", M + twoW + gap2 + twoW / 2, 112 + twoH + 6, "#5A4252");

const n5Y = 112 + twoH + 26;
doc.roundedRect(M, n5Y, PW - M * 2, 56, 8).fill("#FDF5F8");
doc.fillColor("#5A4252").font("Helvetica").fontSize(9)
  .text(
    "Learn: For Today featured article with Lanna mascot + read time. Filter by Cycle basics, PMOS, Nutrition, Mental health. Recommended list drawn from the user's personalisation choices.\n" +
    "Check-In: full symptom grid with character illustrations. Segments: Physical, Hormonal, PMOS indicators. Toggle to Body Map for pain-point marking. Save + Health Summary CTA at bottom.",
    M + 14, n5Y + 10, { width: PW - M * 2 - 28, lineGap: 3 }
  );

// ── BACK COVER ───────────────────────────────────────────────────────────────
addPage();
bg();
doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(20)
  .text('"It\'s your cycle.\nWe just help you understand it."', 0, PH / 2 - 50,
    { align: "center", width: PW, lineGap: 10 });
doc.font("Helvetica").fontSize(9).fillColor("rgba(255,255,255,0.55)")
  .text("olanna.health  ·  Lanna Period Tracker v2  ·  Confidential", 0, PH - 54, { align: "center" });

doc.end();
doc.on("finish", () => console.log("PDF written →", OUT));
