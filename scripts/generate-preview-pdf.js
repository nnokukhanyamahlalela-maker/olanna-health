const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "../olanna-health-preview.pdf");
const ASSETS = path.join(__dirname, "../attached_assets");

// Page size: A4 portrait
const W = 595.28;
const H = 841.89;
const MARGIN = 36;

const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false });
doc.pipe(fs.createWriteStream(OUT));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addPage() {
  doc.addPage({ size: "A4", margin: 0 });
}

function gradientRect(x, y, w, h) {
  const grad = doc.linearGradient(x, y, x + w, y + h);
  grad.stop(0, "#FF9A6B").stop(0.33, "#FF3F9E").stop(0.66, "#F7B0C8").stop(1, "#E7C2E8");
  doc.rect(x, y, w, h).fill(grad);
}

function sectionHeader(title, subtitle) {
  addPage();
  gradientRect(0, 0, W, 120);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(26).text(title, MARGIN, 42, { width: W - MARGIN * 2 });
  if (subtitle) {
    doc.fillColor("rgba(255,255,255,0.85)").font("Helvetica").fontSize(12).text(subtitle, MARGIN, 78, { width: W - MARGIN * 2 });
  }
  return 138; // y cursor after header
}

function drawPhoneMockup(imgPath, x, y, imgW, imgH) {
  const R = 18;
  // Shadow
  doc.roundedRect(x + 3, y + 3, imgW, imgH, R).fill("#00000018");
  // Phone border
  doc.roundedRect(x, y, imgW, imgH, R).lineWidth(2).strokeColor("#FFFFFF").fillColor("#FFFFFF").fillAndStroke();
  // Image
  if (fs.existsSync(imgPath)) {
    doc.save();
    doc.roundedRect(x + 1, y + 1, imgW - 2, imgH - 2, R - 1).clip();
    doc.image(imgPath, x + 1, y + 1, { width: imgW - 2, height: imgH - 2, cover: [imgW - 2, imgH - 2], align: "center", valign: "top" });
    doc.restore();
  }
}

function caption(text, x, y, w) {
  doc.fillColor("#5A4252").font("Helvetica").fontSize(9).text(text, x, y, { width: w, align: "center" });
}

// ─── Cover page ───────────────────────────────────────────────────────────────

addPage();
gradientRect(0, 0, W, H);

// Logo / lotus icon centred
const splashPath = path.join(ASSETS, "Olanna_Health-iOS-Default-1024x1024@1x_1772393507374.png");
if (fs.existsSync(splashPath)) {
  doc.save();
  const iconSize = 100;
  const ix = (W - iconSize) / 2;
  doc.circle(ix + iconSize / 2, 300, iconSize / 2 + 6).fill("rgba(255,255,255,0.2)");
  doc.circle(ix + iconSize / 2, 300, iconSize / 2).clip();
  doc.image(splashPath, ix, 300 - iconSize / 2, { width: iconSize });
  doc.restore();
}

doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(38).text("OLANNA", 0, 420, { align: "center", characterSpacing: 6 });
doc.font("Helvetica").fontSize(14).text("H E A L T H", 0, 464, { align: "center", characterSpacing: 8, fillColor: "rgba(255,255,255,0.8)" });
doc.fontSize(11).fillColor("rgba(255,255,255,0.7)").text("App Preview — Design & Screen Reference", 0, 500, { align: "center" });

doc.fontSize(9).fillColor("rgba(255,255,255,0.5)").text("Lanna Period Tracker v2  ·  Confidential", 0, H - 50, { align: "center" });

// ─── Section 1 — Onboarding ───────────────────────────────────────────────────

const onboardScreens = [
  { file: "onboard_lanna_v6_1785248843758.png",      label: "Welcome — Lanna intro" },
  { file: "onboard_valueprop_1785276523729.png",      label: "Value props carousel" },
  { file: "onboard_name_1785248843757.png",           label: "Name entry" },
  { file: "onboard_personalize_1785248843757.png",    label: "Personalise" },
  { file: "onboard_lastperiod_nomascot_1785248843757.png", label: "Last period date" },
];

let y = sectionHeader("Onboarding", "First-run experience — Lanna intro, value props, and cycle setup");

const PHONE_W = 88;
const PHONE_H = 176;
const PHONE_GAP = (W - MARGIN * 2 - PHONE_W * 5) / 4;

onboardScreens.forEach((s, i) => {
  const x = MARGIN + i * (PHONE_W + PHONE_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y, PHONE_W, PHONE_H);
  caption(s.label, x, y + PHONE_H + 6, PHONE_W);
});

// Second onboarding row
const onboardRow2 = [
  { file: "onboard_lastperiod_uploadmode_1785248843757.png", label: "Import via screenshot" },
];
onboardRow2.forEach((s, i) => {
  const x = MARGIN + i * (PHONE_W + PHONE_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y + PHONE_H + 32, PHONE_W, PHONE_H);
  caption(s.label, x, y + PHONE_H + 32 + PHONE_H + 6, PHONE_W);
});

// ─── Section 2 — Home / Lotus Cycle ───────────────────────────────────────────

const phaseScreens = [
  { file: "screen_menstrual_finalnav_1785248843758.png",   label: "Menstrual phase" },
  { file: "screen_follicular_finalnav_1785248843757.png",  label: "Follicular phase" },
  { file: "screen_ovulatory_finalnav_1785248843758.png",   label: "Ovulatory phase" },
  { file: "screen_luteal_finalnav_1785248843757.png",      label: "Luteal phase" },
];

y = sectionHeader("Home — Lotus Cycle Wheel", "Phase-responsive home screen — colour palette shifts with each cycle phase");

const PH_W = 106;
const PH_H = 212;
const PH_GAP = (W - MARGIN * 2 - PH_W * 4) / 3;

phaseScreens.forEach((s, i) => {
  const x = MARGIN + i * (PH_W + PH_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y, PH_W, PH_H);
  caption(s.label, x, y + PH_H + 6, PH_W);
});

// Phase colours key
const phases = [
  { name: "Menstrual", color: "#F06B9A" },
  { name: "Follicular", color: "#D178B3" },
  { name: "Ovulatory", color: "#DE73DE" },
  { name: "Luteal", color: "#C9A0DC" },
];
const swatchY = y + PH_H + 30;
const swatchW = (W - MARGIN * 2) / 4;
phases.forEach((p, i) => {
  const sx = MARGIN + i * swatchW;
  doc.roundedRect(sx + 10, swatchY, swatchW - 20, 16, 4).fill(p.color);
  doc.fillColor("#5A4252").font("Helvetica").fontSize(8).text(p.name, sx, swatchY + 20, { width: swatchW - 20, align: "center" });
  doc.fillColor("#8A6F80").fontSize(7).text(p.color, sx, swatchY + 31, { width: swatchW - 20, align: "center" });
});

// ─── Section 3 — Check-In ─────────────────────────────────────────────────────

y = sectionHeader("Check-In & Quick Log", "Symptom grid, body map pain points, and fast domain-based logging");

const CI_W = 140;
const CI_H = 280;
const CI_GAP = (W - MARGIN * 2 - CI_W * 3) / 2;

const checkInScreens = [
  { file: "screenshot_cycle.png",                        label: "Lotus home" },
  { file: "checkin_with_pmos_1785251806177.png",         label: "Full check-in" },
  { file: "quicklog_mascots_1785251806178.png",          label: "Quick log sheet" },
];

checkInScreens.forEach((s, i) => {
  const x = MARGIN + i * (CI_W + CI_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y, CI_W, CI_H);
  caption(s.label, x, y + CI_H + 6, CI_W);
});

// ─── Section 4 — Health & Insights ────────────────────────────────────────────

y = sectionHeader("Health Summary, Calendar & Insights", "Doctor-ready data export, calendar view, and cycle insights");

const HI_W = 140;
const HI_H = 280;
const HI_GAP = (W - MARGIN * 2 - HI_W * 3) / 2;

const healthScreens = [
  { file: "screenshot_health.png",   label: "Health summary" },
  { file: "screenshot_calendar.png", label: "Calendar view" },
  { file: "screenshot_insights.png", label: "Insights" },
];

healthScreens.forEach((s, i) => {
  const x = MARGIN + i * (HI_W + HI_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y, HI_W, HI_H);
  caption(s.label, x, y + HI_H + 6, HI_W);
});

// ─── Section 5 — Brand & All-Phases visual ────────────────────────────────────

y = sectionHeader("Brand Design System", "Colour palette, phase system, and all-phases visual reference");

// Brand swatches image
const swatchImg = path.join(ASSETS, "brand_swatches3_1785248843755.png");
if (fs.existsSync(swatchImg)) {
  const sw = W - MARGIN * 2;
  const sh = 160;
  doc.save();
  doc.roundedRect(MARGIN, y, sw, sh, 10).clip();
  doc.image(swatchImg, MARGIN, y, { width: sw, height: sh, cover: [sw, sh] });
  doc.restore();
  y += sh + 16;
}

// All-phases brand image
const allPhasesImg = path.join(ASSETS, "all_phases_brand8_1785248843750.png");
if (fs.existsSync(allPhasesImg)) {
  const aw = W - MARGIN * 2;
  const ah = Math.min(340, H - y - MARGIN - 40);
  doc.save();
  doc.roundedRect(MARGIN, y, aw, ah, 10).clip();
  doc.image(allPhasesImg, MARGIN, y, { width: aw, height: ah, cover: [aw, ah], valign: "top" });
  doc.restore();
}

// ─── Section 6 — Notifications & Partner ──────────────────────────────────────

y = sectionHeader("Notifications & Partner Mode", "6-category push notification system and partner-linked view");

const NP_W = 106;
const NP_H = 212;
const NP_GAP = (W - MARGIN * 2 - NP_W * 4) / 3;

const notifScreens = [
  { file: "screenshot_notif_her_1.png",     label: "Notification — alert" },
  { file: "screenshot_notif_her_2.png",     label: "Notification — reminder" },
  { file: "screenshot_notif_partner_1.png", label: "Partner view 1" },
  { file: "screenshot_notif_partner_2.png", label: "Partner view 2" },
].filter(s => fs.existsSync(path.join(ASSETS, s.file)));

notifScreens.forEach((s, i) => {
  const x = MARGIN + i * (NP_W + NP_GAP);
  drawPhoneMockup(path.join(ASSETS, s.file), x, y, NP_W, NP_H);
  caption(s.label, x, y + NP_H + 6, NP_W);
});

// ─── Final: back cover ────────────────────────────────────────────────────────

addPage();
gradientRect(0, 0, W, H);
doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18).text(
  '"It\'s your cycle.\nWe just help you understand it."',
  MARGIN, H / 2 - 40,
  { width: W - MARGIN * 2, align: "center", lineGap: 8 }
);
doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.6)").text(
  "olanna.health  ·  Lanna Period Tracker v2",
  0, H - 60,
  { align: "center" }
);

doc.end();
doc.on("finish", () => console.log("PDF written to", OUT));
