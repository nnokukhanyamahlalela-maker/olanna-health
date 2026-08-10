/**
 * SymptomCharacter
 * SVG illustrated mascot characters for each symptom in the Check-In screen.
 * Matches the design reference: kawaii style, shape communicates symptom,
 * face expression reflects severity/experience.
 *
 * All characters use a 64×64 viewBox unless noted.
 */

import React from "react";
import Svg, {
  Path, Ellipse, Circle, Line, Rect, G, Polygon,
} from "react-native-svg";

// ─── Shared face primitives ───────────────────────────────────────────────────

function SleepyEyes({ lx, rx, y, stroke = "#2D1A1A" }: {
  lx: number; rx: number; y: number; stroke?: string;
}) {
  return (
    <>
      <Path d={`M ${lx-5} ${y} Q ${lx} ${y-5} ${lx+5} ${y}`} stroke={stroke} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <Path d={`M ${rx-5} ${y} Q ${rx} ${y-5} ${rx+5} ${y}`} stroke={stroke} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </>
  );
}

function DotEyes({ lx, rx, y, r = 2.5, fill = "#2D1A1A" }: {
  lx: number; rx: number; y: number; r?: number; fill?: string;
}) {
  return (
    <>
      <Circle cx={lx} cy={y} r={r} fill={fill} />
      <Circle cx={rx} cy={y} r={r} fill={fill} />
      <Circle cx={lx+0.8} cy={y-0.8} r={0.8} fill="white" />
      <Circle cx={rx+0.8} cy={y-0.8} r={0.8} fill="white" />
    </>
  );
}

function PainedEyes({ lx, rx, y, stroke = "#2D1A1A" }: {
  lx: number; rx: number; y: number; stroke?: string;
}) {
  // "X" eyes or downward arcs (squinting in pain)
  return (
    <>
      <Path d={`M ${lx-4} ${y-3} L ${lx+4} ${y+3}`} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M ${lx+4} ${y-3} L ${lx-4} ${y+3}`} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M ${rx-4} ${y-3} L ${rx+4} ${y+3}`} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M ${rx+4} ${y-3} L ${rx-4} ${y+3}`} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function Cheeks({ lx, rx, y, color = "#F5A8C0" }: {
  lx: number; rx: number; y: number; color?: string;
}) {
  return (
    <>
      <Ellipse cx={lx} cy={y} rx={6} ry={4} fill={color} opacity={0.6} />
      <Ellipse cx={rx} cy={y} rx={6} ry={4} fill={color} opacity={0.6} />
    </>
  );
}

function Smile({ cx, cy, w = 10, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return (
    <Path d={`M ${cx-w/2} ${cy} Q ${cx} ${cy+5} ${cx+w/2} ${cy}`}
      stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" />
  );
}

function Frown({ cx, cy, w = 9, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return (
    <Path d={`M ${cx-w/2} ${cy+4} Q ${cx} ${cy} ${cx+w/2} ${cy+4}`}
      stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" />
  );
}

function NeutralMouth({ cx, cy, w = 8, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return <Line x1={cx-w/2} y1={cy} x2={cx+w/2} y2={cy} stroke={stroke} strokeWidth={2} strokeLinecap="round" />;
}

// ─── Character components ─────────────────────────────────────────────────────

/** Cramps — spiky sun burst with pained face */
function Cramps({ size }: { size: number }) {
  const spikes = 8;
  const cx = 32, cy = 32, r1 = 18, r2 = 26;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? r2 : r1;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Polygon points={points.join(" ")} fill="#F07090" />
      <Circle cx={32} cy={32} r={15} fill="#F5A0B8" />
      <Cheeks lx={23} rx={41} y={36} color="#E87090" />
      <PainedEyes lx={26} rx={38} y={29} stroke="#8B2040" />
      <Frown cx={32} cy={39} stroke="#8B2040" />
    </Svg>
  );
}

/** Bloating — puffy round face, uncomfortable */
function Bloating({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Puffy circle — slightly larger to look bloated */}
      <Ellipse cx={32} cy={34} rx={26} ry={24} fill="#E8A870" />
      {/* Highlight */}
      <Ellipse cx={23} cy={24} rx={8} ry={6} fill="white" opacity={0.15} />
      <Cheeks lx={19} rx={45} y={38} color="#F5C8A0" />
      {/* Uncomfortable eyes — slightly squinting */}
      <Path d="M 22 29 Q 26 26 30 29" stroke="#4D2800" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <Path d="M 34 29 Q 38 26 42 29" stroke="#4D2800" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* Slightly puffed out cheek expression */}
      <Path d="M 26 38 Q 32 42 38 38" stroke="#4D2800" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Fatigue — grey cloud with droopy face */
function Fatigue({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 64">
      {/* Cloud shape: multiple overlapping circles */}
      <Circle cx={36} cy={38} r={20} fill="#B8C4CC" />
      <Circle cx={22} cy={40} r={15} fill="#B8C4CC" />
      <Circle cx={50} cy={40} r={15} fill="#B8C4CC" />
      <Circle cx={28} cy={28} r={14} fill="#C4D0D8" />
      <Circle cx={44} cy={26} r={16} fill="#C4D0D8" />
      <Circle cx={36} cy={22} r={12} fill="#D0D8E0" />
      {/* Droopy sleepy face in center */}
      <SleepyEyes lx={28} rx={44} y={40} stroke="#556070" />
      <Cheeks lx={21} rx={51} y={46} color="#D4A0B0" />
      <NeutralMouth cx={36} cy={50} w={10} stroke="#556070" />
    </Svg>
  );
}

/** Pelvic pain — pink circle with pulsing pain rings */
function PelvicPain({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Outer pain pulse rings */}
      <Circle cx={32} cy={32} r={30} fill="none" stroke="#F5A0B8" strokeWidth={2} strokeDasharray="4,4" opacity={0.5} />
      <Circle cx={32} cy={32} r={24} fill="none" stroke="#F5A0B8" strokeWidth={2} strokeDasharray="4,4" opacity={0.7} />
      {/* Body */}
      <Circle cx={32} cy={32} r={18} fill="#F0B8CC" />
      <Cheeks lx={23} rx={41} y={36} color="#E07090" />
      <PainedEyes lx={26} rx={38} y={28} stroke="#8B304C" />
      <Frown cx={32} cy={38} w={9} stroke="#8B304C" />
    </Svg>
  );
}

/** Sugar cravings — peachy happy round face */
function SugarCravings({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={26} fill="#F0C8A8" />
      <Ellipse cx={22} cy={22} rx={8} ry={6} fill="white" opacity={0.15} />
      <Cheeks lx={19} rx={45} y={36} color="#F5A0B0" />
      <DotEyes lx={25} rx={39} y={28} r={3} />
      {/* Excited/wanting expression — slight open mouth smile */}
      <Path d="M 25 38 Q 32 44 39 38" stroke="#8B4428" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* Little sparkle dots above */}
      <Circle cx={46} cy={18} r={2} fill="#F5A0B0" />
      <Circle cx={52} cy={14} r={1.5} fill="#F5A0B0" />
      <Circle cx={50} cy={22} r={1} fill="#F5A0B0" />
    </Svg>
  );
}

/** Water retention — blue heavy water drop */
function WaterRetention({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 64 72">
      {/* Teardrop */}
      <Path
        d="M 32 4 C 48 16, 58 32, 58 48 C 58 60, 46 68, 32 68 C 18 68, 6 60, 6 48 C 6 32, 16 16, 32 4 Z"
        fill="#6BACD8"
      />
      <Ellipse cx={22} cy={26} rx={7} ry={10} fill="white" opacity={0.12} transform="rotate(-30,22,26)" />
      <Cheeks lx={20} rx={44} y={52} color="#A0D0F0" />
      {/* Heavy droopy eyes */}
      <SleepyEyes lx={24} rx={40} y={43} stroke="#2A5A8A" />
      <Frown cx={32} cy={58} w={10} stroke="#2A5A8A" />
    </Svg>
  );
}

/** Headache — round face with lightning bolt on top */
function Headache({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={36} r={22} fill="#E8B0C0" />
      <Cheeks lx={20} rx={44} y={42} color="#D48090" />
      <PainedEyes lx={26} rx={38} y={33} stroke="#6A2840" />
      <Frown cx={32} cy={43} w={9} stroke="#6A2840" />
      {/* Lightning bolt on head */}
      <Path d="M 34 4 L 24 20 L 30 20 L 22 34 L 38 16 L 32 16 Z" fill="#F5C840" />
      <Path d="M 34 4 L 24 20 L 30 20 L 22 34 L 38 16 L 32 16 Z" fill="none" stroke="#D4A000" strokeWidth={1} strokeLinejoin="round" />
    </Svg>
  );
}

/** Nausea — green queasy round face */
function Nausea({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={26} fill="#8FC88A" />
      <Ellipse cx={22} cy={22} rx={8} ry={6} fill="white" opacity={0.15} />
      <Cheeks lx={19} rx={45} y={36} color="#A8D8A4" />
      {/* Queasy eyes — half open arcs */}
      <Path d="M 22 27 Q 26 24 30 27" stroke="#2A5020" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <Path d="M 34 27 Q 38 24 42 27" stroke="#2A5020" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* Wavy mouth (queasy) */}
      <Path d="M 24 40 Q 28 38 32 40 Q 36 42 40 40" stroke="#2A5020" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Pelvic heaviness — brown/tan drooping oval */
function PelvicHeaviness({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 64 58">
      {/* Wide heavy oval, slightly drooping */}
      <Ellipse cx={32} cy={32} rx={26} ry={20} fill="#C4906A" />
      {/* Weight lines at bottom */}
      <Path d="M 22 46 L 20 54" stroke="#A87050" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M 32 48 L 32 56" stroke="#A87050" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M 42 46 L 44 54" stroke="#A87050" strokeWidth={2.5} strokeLinecap="round" />
      <Cheeks lx={20} rx={44} y={34} color="#E8B890" />
      <SleepyEyes lx={24} rx={40} y={28} stroke="#6A3820" />
      <Frown cx={32} cy={38} w={9} stroke="#6A3820" />
    </Svg>
  );
}

/** Breast tenderness — pink petal/flower shape */
function BreastTenderness({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Petal shape: wide oval */}
      <Ellipse cx={32} cy={34} rx={22} ry={26} fill="#F0A0B8" />
      {/* Inner petal highlight */}
      <Ellipse cx={26} cy={26} rx={7} ry={10} fill="white" opacity={0.2} />
      <Cheeks lx={20} rx={44} y={38} color="#E07090" />
      {/* Tender expression — slightly worried */}
      <Path d="M 23 29 Q 27 26 31 29" stroke="#8B304C" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 33 29 Q 37 26 41 29" stroke="#8B304C" strokeWidth={2} fill="none" strokeLinecap="round" />
      <NeutralMouth cx={32} cy={42} w={9} stroke="#8B304C" />
    </Svg>
  );
}

/** Breast swelling — pink spiky/bumpy round */
function BreastSwelling({ size }: { size: number }) {
  // Bumpy circle: circle with small bumps around edge
  const bumps = 10;
  const cx = 32, cy = 32, r1 = 17, r2 = 22;
  const pts: string[] = [];
  for (let i = 0; i < bumps * 2; i++) {
    const r = i % 2 === 0 ? r2 : r1;
    const angle = (i / (bumps * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Polygon points={pts.join(" ")} fill="#F5B0C8" />
      <Circle cx={32} cy={32} r={14} fill="#F8C8D8" />
      <Cheeks lx={23} rx={41} y={36} color="#E07090" />
      <SleepyEyes lx={26} rx={38} y={28} stroke="#8B304C" />
      <NeutralMouth cx={32} cy={40} w={9} stroke="#8B304C" />
    </Svg>
  );
}

/** Migraine — lightning bolt with intense face */
function Migraine({ size }: { size: number }) {
  return (
    <Svg width={size * 0.85} height={size} viewBox="0 0 54 72">
      <Path
        d="M 42 4 L 14 40 L 28 40 L 10 70 L 48 32 L 34 32 Z"
        fill="#E8607A"
      />
      <Path
        d="M 42 4 L 14 40 L 28 40 L 10 70 L 48 32 L 34 32 Z"
        fill="none" stroke="#C04060" strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Face in bolt middle */}
      <Cheeks lx={22} rx={34} y={52} color="#F5D0D8" />
      <PainedEyes lx={23} rx={33} y={45} stroke="#6A1830" />
      <Frown cx={28} cy={56} w={8} stroke="#6A1830" />
    </Svg>
  );
}

// ─── PMOS characters ──────────────────────────────────────────────────────────

/** Excess hair — round face with hair lines radiating out */
function ExcessHair({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Hair lines radiating */}
      {[30, 50, 70, 90, 110, 130, 150].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r1 = 20, r2 = 30;
        return (
          <Line
            key={i}
            x1={32 + r1 * Math.cos(rad - Math.PI / 2)}
            y1={32 + r1 * Math.sin(rad - Math.PI / 2)}
            x2={32 + r2 * Math.cos(rad - Math.PI / 2)}
            y2={32 + r2 * Math.sin(rad - Math.PI / 2)}
            stroke="#8B6040" strokeWidth={2.5} strokeLinecap="round"
          />
        );
      })}
      <Circle cx={32} cy={32} r={18} fill="#F0C8A0" />
      <Cheeks lx={22} rx={42} y={36} color="#F5A8B8" />
      <SleepyEyes lx={26} rx={38} y={29} stroke="#4A2810" />
      <NeutralMouth cx={32} cy={40} w={9} stroke="#4A2810" />
    </Svg>
  );
}

/** Hair thinning — face with sparse thin lines on top */
function HairThinning({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Sparse hair lines */}
      <Line x1={24} y1={12} x2={24} y2={4} stroke="#8B7050" strokeWidth={2} strokeLinecap="round" />
      <Line x1={32} y1={11} x2={32} y2={3} stroke="#8B7050" strokeWidth={2} strokeLinecap="round" />
      <Line x1={40} y1={12} x2={40} y2={4} stroke="#8B7050" strokeWidth={2} strokeLinecap="round" />
      <Line x1={20} y1={14} x2={18} y2={6} stroke="#8B7050" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={44} y1={14} x2={46} y2={6} stroke="#8B7050" strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={32} cy={34} r={20} fill="#F0D0B0" />
      <Cheeks lx={21} rx={43} y={38} color="#F5A8B8" />
      <SleepyEyes lx={25} rx={39} y={31} stroke="#4A2810" />
      <NeutralMouth cx={32} cy={42} w={9} stroke="#4A2810" />
    </Svg>
  );
}

/** Acne / oily skin — peachy face with pink dots */
function AcneSkin({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#F0C898" />
      <Ellipse cx={22} cy={22} rx={7} ry={5} fill="white" opacity={0.15} />
      {/* Acne spots */}
      <Circle cx={44} cy={24} r={3.5} fill="#E07080" />
      <Circle cx={48} cy={32} r={2.5} fill="#E07080" />
      <Circle cx={44} cy={40} r={3} fill="#E07080" />
      <Circle cx={18} cy={28} r={2.5} fill="#E07080" />
      <Circle cx={16} cy={36} r={2} fill="#E07080" />
      <Cheeks lx={20} rx={44} y={38} color="#F5A8B0" />
      <DotEyes lx={26} rx={38} y={29} r={2.5} fill="#4A2810" />
      <NeutralMouth cx={32} cy={42} w={9} stroke="#4A2810" />
    </Svg>
  );
}

/** Irregular cycle — calendar with question mark */
function IrregularCycle({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Calendar body */}
      <Rect x={8} y={14} width={48} height={44} rx={8} ry={8} fill="#9AACD8" />
      <Rect x={8} y={14} width={48} height={14} rx={8} ry={8} fill="#6080C0" />
      <Rect x={8} y={21} width={48} height={7} fill="#6080C0" />
      {/* Calendar pins */}
      <Rect x={20} y={9} width={5} height={12} rx={2} ry={2} fill="#4060A8" />
      <Rect x={39} y={9} width={5} height={12} rx={2} ry={2} fill="#4060A8" />
      {/* Question mark */}
      <Path d="M 27 32 Q 27 26 32 26 Q 37 26 37 31 Q 37 35 32 37 L 32 41" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Circle cx={32} cy={46} r={2} fill="white" />
    </Svg>
  );
}

/** Skin darkening — neutral face with darker patch */
function SkinDarkening({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#C49060" />
      {/* Darker patch areas */}
      <Ellipse cx={22} cy={28} rx={8} ry={6} fill="#A87040" opacity={0.6} />
      <Ellipse cx={42} cy={28} rx={8} ry={6} fill="#A87040" opacity={0.6} />
      <Cheeks lx={19} rx={45} y={38} color="#D4A878" />
      <DotEyes lx={25} rx={39} y={29} r={2.5} fill="#3A1808" />
      <NeutralMouth cx={32} cy={42} w={9} stroke="#3A1808" />
    </Svg>
  );
}

/** Weight changes — round face with +/- symbols */
function WeightChanges({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={22} fill="#88C898" />
      <Ellipse cx={22} cy={22} rx={7} ry={5} fill="white" opacity={0.15} />
      <Cheeks lx={21} rx={43} y={36} color="#F5D0B0" />
      <DotEyes lx={26} rx={38} y={28} r={2.5} fill="#2A4A2A" />
      <NeutralMouth cx={32} cy={40} w={9} stroke="#2A4A2A" />
      {/* +/- symbols around face */}
      {/* Plus */}
      <Line x1={10} y1={24} x2={18} y2={24} stroke="#2A6A2A" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={14} y1={20} x2={14} y2={28} stroke="#2A6A2A" strokeWidth={2.5} strokeLinecap="round" />
      {/* Minus */}
      <Line x1={46} y1={24} x2={54} y2={24} stroke="#6A2A2A" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Ovulation/fertility — simple warm neutral egg face */
function OvulationFertility({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 64 72">
      {/* Egg/oval shape */}
      <Ellipse cx={32} cy={38} rx={22} ry={28} fill="#F0D8B0" />
      <Ellipse cx={23} cy={25} rx={7} ry={9} fill="white" opacity={0.15} />
      <Cheeks lx={21} rx={43} y={42} color="#F5A8B0" />
      <DotEyes lx={26} rx={38} y={35} r={2.5} fill="#4A3020" />
      <NeutralMouth cx={32} cy={47} w={9} stroke="#4A3020" />
    </Svg>
  );
}

/** Generic placeholder — neutral face circle */
function GenericSymptom({ size, color = "#D4B8C8" }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill={color} />
      <DotEyes lx={25} rx={39} y={28} r={2.5} fill="#4A2828" />
      <NeutralMouth cx={32} cy={40} w={9} stroke="#4A2828" />
    </Svg>
  );
}

// ─── Additional characters ────────────────────────────────────────────────────

/** Irritable — orange face, V-brows, tight mouth, steam wisps */
function Irritable({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#E89060" />
      <Cheeks lx={20} rx={44} y={38} color="#F5C0A0" />
      <Path d="M 17 24 Q 21 20 25 23" stroke="#5A2000" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 39 23 Q 43 20 47 24" stroke="#5A2000" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <DotEyes lx={25} rx={39} y={32} r={2.5} fill="#5A2000" />
      <Path d="M 24 44 L 40 44" stroke="#5A2000" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M 47 22 Q 49 18 47 14" stroke="#5A2000" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5} />
      <Path d="M 51 25 Q 53 21 51 17" stroke="#5A2000" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Anxious — lavender face, worried brows, sweat drop */
function Anxious({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#C4B8D8" />
      <Cheeks lx={20} rx={44} y={38} color="#D8C8F0" />
      <Path d="M 17 25 Q 21 21 25 24" stroke="#3A2860" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 39 24 Q 43 21 47 25" stroke="#3A2860" strokeWidth={2} fill="none" strokeLinecap="round" />
      <DotEyes lx={25} rx={39} y={33} r={2.5} fill="#3A2860" />
      <Path d="M 25 42 Q 28 39 32 42 Q 36 45 39 42" stroke="#3A2860" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 48 22 L 47 28 Q 46 30 48 30 Q 50 30 49 28 Z" fill="#A898C8" opacity={0.7} />
    </Svg>
  );
}

/** Low mood — blue face with frown and rain drops */
function LowMood({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={36} r={22} fill="#7AAAD0" />
      <Cheeks lx={21} rx={43} y={42} color="#A0C8F0" />
      <SleepyEyes lx={25} rx={39} y={32} stroke="#1A3858" />
      <Frown cx={32} cy={44} w={12} stroke="#1A3858" />
      {[22,30,38,26,34].map((x, i) => (
        <Path key={i} d={`M ${x} ${14 + (i % 3) * 3} L ${x - 1} ${20 + (i % 3) * 3}`}
          stroke="#4A88C0" strokeWidth={2} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

/** Calm & grounded — soft green face, closed eyes, leaf motif */
function CalmGrounded({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={34} rx={24} ry={22} fill="#7DC89A" />
      <Ellipse cx={22} cy={24} rx={7} ry={5} fill="white" opacity={0.15} />
      <SleepyEyes lx={24} rx={40} y={32} stroke="#1A4828" />
      <Smile cx={32} cy={42} w={12} stroke="#1A4828" />
      <Path d="M 50 16 Q 54 10 58 12 Q 56 18 50 16 Z" fill="#5AA870" />
      <Path d="M 50 16 L 54 12" stroke="#3A8050" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Tearful — face with rolling tear */
function Tearful({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#8EB8D8" />
      <Cheeks lx={20} rx={44} y={38} color="#C0D8F0" />
      <SleepyEyes lx={25} rx={39} y={28} stroke="#1A3858" />
      <Frown cx={32} cy={42} w={10} stroke="#1A3858" />
      <Path d="M 25 30 L 24 36 Q 23 39 25 39 Q 27 39 26 36 Z" fill="#7AAAD0" opacity={0.85} />
    </Svg>
  );
}

/** Brain fog — grey cloud face with hazy squint eyes (distinct from Fatigue) */
function BrainFogChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 64">
      <Circle cx={36} cy={42} r={18} fill="#9AAABE" />
      <Circle cx={22} cy={44} r={13} fill="#9AAABE" />
      <Circle cx={50} cy={44} r={13} fill="#9AAABE" />
      <Circle cx={28} cy={32} r={13} fill="#A8B8CC" />
      <Circle cx={44} cy={30} r={15} fill="#A8B8CC" />
      <Circle cx={36} cy={26} r={11} fill="#B8C8DC" />
      <Path d="M 27 44 Q 29 42 31 44 Q 33 46 35 44" stroke="#3A4858" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 37 44 Q 39 42 41 44 Q 43 46 45 44" stroke="#3A4858" strokeWidth={2} fill="none" strokeLinecap="round" />
      <NeutralMouth cx={36} cy={52} w={10} stroke="#3A4858" />
    </Svg>
  );
}

/** Insomnia — dark circle, wide open eyes, crescent moon and stars */
function InsomniaChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={34} r={22} fill="#4A3870" />
      <Cheeks lx={21} rx={43} y={40} color="#9880C0" />
      <DotEyes lx={25} rx={39} y={30} r={3.5} fill="#E8D8F0" />
      <Circle cx={25.8} cy={28.8} r={1} fill="white" />
      <Circle cx={39.8} cy={28.8} r={1} fill="white" />
      <NeutralMouth cx={32} cy={44} w={10} stroke="#9880C0" />
      <Path d="M 42 8 Q 48 12 46 20 Q 54 16 54 10 Q 52 4 44 4 Q 40 4 38 8 Q 40 7 42 8 Z" fill="#F0D080" />
      <Circle cx={20} cy={10} r={1.5} fill="#F0D080" />
      <Circle cx={28} cy={6}  r={1}   fill="#F0D080" />
      <Circle cx={14} cy={18} r={1}   fill="#F0D080" />
    </Svg>
  );
}

/** Good sleep — crescent moon with peaceful face and Zs */
function SleepGoodChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 6 Q 44 10 48 24 Q 52 38 44 50 Q 38 56 30 56 Q 20 56 14 48 Q 8 38 12 26 Q 20 28 28 22 Q 36 16 32 6 Z"
        fill="#9080C0" />
      <SleepyEyes lx={26} rx={38} y={36} stroke="#F0E8FF" />
      <Smile cx={32} cy={44} w={10} stroke="#F0E8FF" />
      <Path d="M 46 18 L 52 18 L 46 24 L 52 24" stroke="#F0D080" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 50 10 L 54 10 L 50 15 L 54 15" stroke="#F0D080" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Poor sleep — heavy dark circles under droopy eyes */
function SleepPoorChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#A898B8" />
      <Ellipse cx={24} cy={33} rx={8}  ry={5} fill="#7870A0" opacity={0.5} />
      <Ellipse cx={40} cy={33} rx={8}  ry={5} fill="#7870A0" opacity={0.5} />
      <SleepyEyes lx={24} rx={40} y={30} stroke="#3A2858" />
      <Frown cx={32} cy={44} w={10} stroke="#3A2858" />
      <Path d="M 48 14 L 54 14 L 48 20 L 54 20" stroke="#9888B0" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** High physical energy — sun face with radiating rays */
function EnergyHighChar({ size }: { size: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return { x1: 32 + 26 * Math.cos(angle), y1: 32 + 26 * Math.sin(angle), x2: 32 + 32 * Math.cos(angle), y2: 32 + 32 * Math.sin(angle) };
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {rays.map((r, i) => (
        <Path key={i} d={`M ${r.x1} ${r.y1} L ${r.x2} ${r.y2}`} stroke="#E09030" strokeWidth={2.5} strokeLinecap="round" />
      ))}
      <Circle cx={32} cy={32} r={20} fill="#F5C840" />
      <Cheeks lx={21} rx={43} y={36} color="#F0A840" />
      <DotEyes lx={26} rx={38} y={28} r={2.5} fill="#4A2800" />
      <Smile cx={32} cy={38} w={12} stroke="#4A2800" />
    </Svg>
  );
}

/** Libido rising — heart with upward arrow */
function LibidoUpChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 56 C 16 44 8 34 8 24 C 8 16 14 10 22 10 C 26 10 30 12 32 16 C 34 12 38 10 42 10 C 50 10 56 16 56 24 C 56 34 48 44 32 56 Z"
        fill="#F07090" />
      <Path d="M 32 40 L 32 18" stroke="white" strokeWidth={3} strokeLinecap="round" />
      <Path d="M 24 26 L 32 18 L 40 26" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Libido falling — greyed heart with downward arrow */
function LibidoDownChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 56 C 16 44 8 34 8 24 C 8 16 14 10 22 10 C 26 10 30 12 32 16 C 34 12 38 10 42 10 C 50 10 56 16 56 24 C 56 34 48 44 32 56 Z"
        fill="#B09098" />
      <Path d="M 32 20 L 32 42" stroke="white" strokeWidth={3} strokeLinecap="round" />
      <Path d="M 24 34 L 32 42 L 40 34" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Constipation — strained oval face, pressure lines below */
function ConstipationChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={32} rx={22} ry={20} fill="#C4905C" />
      <Cheeks lx={21} rx={43} y={36} color="#E0B880" />
      <PainedEyes lx={25} rx={39} y={27} stroke="#5A2800" />
      <Path d="M 26 42 Q 30 38 34 42 Q 38 46 42 42" stroke="#5A2800" strokeWidth={2} fill="none" strokeLinecap="round" />
      {[18, 25, 32, 39, 46].map((x) => (
        <Path key={x} d={`M ${x} 55 L ${x} 62`} stroke="#A06030" strokeWidth={2} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

/** Diarrhea — rushing oval with motion lines */
function DiarrheaChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 4 28 L 16 28" stroke="#60A8A0" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      <Path d="M 6 36 L 18 36" stroke="#60A8A0" strokeWidth={2}   strokeLinecap="round" opacity={0.4} />
      <Path d="M 4 44 L 14 44" stroke="#60A8A0" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
      <Ellipse cx={36} cy={36} rx={22} ry={20} fill="#60A8A0" />
      <Cheeks lx={26} rx={46} y={40} color="#A0D8D0" />
      <DotEyes lx={30} rx={42} y={30} r={2.5} fill="#1A3830" />
      <Path d="M 28 44 Q 32 48 36 44 Q 40 40 44 44" stroke="#1A3830" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Ovary pain — oval with pulse rings */
function OvaryPain({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={28} fill="none" stroke="#F5A0B8" strokeWidth={1.5} strokeDasharray="4,4" opacity={0.4} />
      <Circle cx={32} cy={32} r={22} fill="none" stroke="#F5A0B8" strokeWidth={1.5} strokeDasharray="4,4" opacity={0.65} />
      <Ellipse cx={32} cy={34} rx={14} ry={12} fill="#F0B8CC" />
      <Cheeks lx={24} rx={40} y={38} color="#E07090" />
      <PainedEyes lx={27} rx={37} y={30} stroke="#8B304C" />
      <Frown cx={32} cy={40} w={8} stroke="#8B304C" />
    </Svg>
  );
}

/** Hip pain — angled oval with radiating pain dot */
function HipPainChar({ size }: { size: number }) {
  const rays = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return { x1: 46 + 5 * Math.cos(angle), y1: 26 + 5 * Math.sin(angle), x2: 46 + 9 * Math.cos(angle), y2: 26 + 9 * Math.sin(angle) };
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={38} rx={26} ry={18} fill="#C8A090" transform="rotate(-15, 32, 38)" />
      <Circle cx={46} cy={26} r={8} fill="#E8B090" />
      <Circle cx={46} cy={26} r={4} fill="#D85A30" opacity={0.7} />
      {rays.map((r, i) => (
        <Path key={i} d={`M ${r.x1} ${r.y1} L ${r.x2} ${r.y2}`} stroke="#D85A30" strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />
      ))}
    </Svg>
  );
}

/** Rectal pain — face with pain star at back */
function RectalPainChar({ size }: { size: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return { x1: 52 + 5 * Math.cos(angle), y1: 18 + 5 * Math.sin(angle), x2: 52 + 9 * Math.cos(angle), y2: 18 + 9 * Math.sin(angle) };
  });
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={30} cy={36} rx={24} ry={20} fill="#C89080" />
      <Cheeks lx={19} rx={41} y={42} color="#E0B090" />
      <SleepyEyes lx={23} rx={37} y={31} stroke="#5A2000" />
      <Frown cx={30} cy={46} w={10} stroke="#5A2000" />
      <Circle cx={52} cy={18} r={5} fill="#D85A30" opacity={0.8} />
      {rays.map((r, i) => (
        <Path key={i} d={`M ${r.x1} ${r.y1} L ${r.x2} ${r.y2}`} stroke="#D85A30" strokeWidth={1.5} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

/** Leg radiating pain — vertical leg with lightning running down */
function LegPainChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 48 64">
      <Rect x={16} y={2} width={16} height={60} rx={8} fill="#C8B090" />
      <Path d="M 28 8 L 22 28 L 27 28 L 21 52 L 34 30 L 29 30 Z" fill="#D85A30" opacity={0.85} />
    </Svg>
  );
}

/** Frequent infections — face with germ spots radiating spikes */
function FrequentInfectionsChar({ size }: { size: number }) {
  const spots = [{ x: 14, y: 18 }, { x: 50, y: 24 }, { x: 48, y: 46 }, { x: 12, y: 42 }];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={22} fill="#88B888" />
      <Cheeks lx={21} rx={43} y={38} color="#A8D0A8" />
      <DotEyes lx={25} rx={39} y={27} r={2.5} fill="#1A3820" />
      <NeutralMouth cx={32} cy={40} w={10} stroke="#1A3820" />
      {spots.map(({ x, y }, si) => (
        <React.Fragment key={si}>
          <Circle cx={x} cy={y} r={5} fill="#D85A30" opacity={0.75} />
          {Array.from({ length: 6 }, (_, j) => {
            const a = (j / 6) * Math.PI * 2;
            return <Path key={j} d={`M ${x + 4 * Math.cos(a)} ${y + 4 * Math.sin(a)} L ${x + 7.5 * Math.cos(a)} ${y + 7.5 * Math.sin(a)}`}
              stroke="#D85A30" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />;
          })}
        </React.Fragment>
      ))}
    </Svg>
  );
}

/** Heat face — sweating orange face with sun overhead */
function HeatFaceChar({ size }: { size: number }) {
  const sunRays = [0, 60, 120, 180, 240, 300];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={10} r={7} fill="#F5C840" />
      {sunRays.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return <Path key={i} d={`M ${32 + 8 * Math.cos(rad)} ${10 + 8 * Math.sin(rad)} L ${32 + 13 * Math.cos(rad)} ${10 + 13 * Math.sin(rad)}`}
          stroke="#F5C840" strokeWidth={2} strokeLinecap="round" />;
      })}
      <Circle cx={32} cy={40} r={20} fill="#F0A860" />
      <Cheeks lx={20} rx={44} y={44} color="#F5C8A0" />
      <DotEyes lx={25} rx={39} y={35} r={2.5} fill="#5A2800" />
      <Frown cx={32} cy={48} w={10} stroke="#5A2800" />
      <Path d="M 47 28 L 46 33 Q 45 35 47 35 Q 49 35 48 33 Z" fill="#F5C840" opacity={0.8} />
      <Path d="M 52 34 L 51 38 Q 50 40 52 40 Q 54 40 53 38 Z" fill="#F5C840" opacity={0.6} />
    </Svg>
  );
}

/** Cold face — blue shivering face with snowflake */
function ColdFaceChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={22} fill="#80B0D8" />
      <Cheeks lx={20} rx={44} y={38} color="#A8D0F0" />
      <Path d="M 22 27 Q 25 25 28 27" stroke="#1A3858" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 36 27 Q 39 25 42 27" stroke="#1A3858" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 26 42 Q 30 38 34 42 Q 38 46 42 42" stroke="#1A3858" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 52 10 L 52 24 M 46 13 L 58 21 M 46 21 L 58 13" stroke="#A8D8F8" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={52} cy={17} r={1.5} fill="#A8D8F8" />
    </Svg>
  );
}

/** Dehydration — dry cracked droplet */
function DehydrationChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 48 56">
      <Path d="M 24 4 C 36 16 42 28 42 38 C 42 48 34 54 24 54 C 14 54 6 48 6 38 C 6 28 12 16 24 4 Z"
        fill="#D8C8A8" stroke="#A89878" strokeWidth={1} />
      <Path d="M 18 30 L 24 38 L 20 46" stroke="#A89878" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 28 34 L 32 40 L 30 46" stroke="#A89878" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 14 38 L 20 34" stroke="#A89878" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Feeling intuitive — eye inside a crescent moon */
function FeelingIntuitiveChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 6 Q 44 10 48 24 Q 52 38 44 50 Q 38 56 30 56 Q 20 56 14 48 Q 8 38 12 26 Q 20 28 28 22 Q 36 16 32 6 Z"
        fill="#9880C0" />
      <Ellipse cx={30} cy={36} rx={10} ry={7} fill="white" />
      <Circle cx={30} cy={36} r={5} fill="#6A50A0" />
      <Circle cx={30} cy={36} r={3} fill="#3A2870" />
      <Circle cx={32} cy={34} r={1.2} fill="white" />
      <Circle cx={46} cy={18} r={1.5} fill="#F0D080" />
      <Circle cx={50} cy={28} r={1}   fill="#F0D080" />
    </Svg>
  );
}

/** Weather sensitivity — circle split: sunny left, rainy right */
function WeatherSensitivityChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 8 A 24 24 0 0 1 32 56 L 32 8 Z" fill="#F5D060" />
      <Path d="M 32 8 A 24 24 0 0 0 32 56 L 32 8 Z" fill="#9AAABE" />
      <Path d="M 32 8 L 32 56" stroke="white" strokeWidth={2} />
      {[270, 225, 180].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return <Path key={i} d={`M ${32 + 25 * Math.cos(rad)} ${32 + 25 * Math.sin(rad)} L ${32 + 30 * Math.cos(rad)} ${32 + 30 * Math.sin(rad)}`}
          stroke="#E0B000" strokeWidth={2} strokeLinecap="round" />;
      })}
      {[{ x: 42, y: 40 }, { x: 48, y: 34 }, { x: 44, y: 48 }].map(({ x, y }, i) => (
        <Path key={i} d={`M ${x} ${y} L ${x - 2} ${y + 6} Q ${x - 2} ${y + 8} ${x} ${y + 8} Q ${x + 2} ${y + 8} ${x + 2} ${y + 6} Z`}
          fill="#5A8AC0" opacity={0.8} />
      ))}
    </Svg>
  );
}

/** Stress flare — face with lightning bolt at temple */
function StressFlareChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={36} r={22} fill="#E8A890" />
      <Cheeks lx={21} rx={43} y={42} color="#F0C0A8" />
      <Path d="M 21 30 Q 24 27 27 30" stroke="#5A2800" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 37 30 Q 40 27 43 30" stroke="#5A2800" strokeWidth={2} fill="none" strokeLinecap="round" />
      <DotEyes lx={25} rx={39} y={32} r={2} fill="#5A2800" />
      <Frown cx={32} cy={46} w={10} stroke="#5A2800" />
      <Path d="M 52 18 L 46 30 L 50 30 L 44 44 L 58 26 L 54 26 Z"
        fill="#F5C840" stroke="#D4A000" strokeWidth={0.8} strokeLinejoin="round" />
    </Svg>
  );
}

/** Back pain — oval with spine bars and pain dot */
function BackPainChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={34} rx={22} ry={20} fill="#B8A880" />
      <Cheeks lx={21} rx={43} y={40} color="#D8C8A0" />
      <SleepyEyes lx={25} rx={39} y={28} stroke="#4A3010" />
      <Frown cx={32} cy={44} w={10} stroke="#4A3010" />
      {[20, 26, 32, 38, 44].map((y) => (
        <Rect key={y} x={29} y={y} width={6} height={3} rx={1} fill="#8A7050" opacity={0.6} />
      ))}
      <Rect x={30.5} y={18} width={3} height={30} rx={1} fill="#8A7050" opacity={0.3} />
      <Circle cx={46} cy={20} r={5} fill="#D85A30" opacity={0.7} />
    </Svg>
  );
}

/** Dizziness — face with swirl eyes */
function DizzinessChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#B8C8D8" />
      <Cheeks lx={20} rx={44} y={38} color="#D0D8F0" />
      <Path d="M 22 26 Q 20 22 24 20 Q 28 18 30 22 Q 32 26 28 28 Q 24 30 22 28"
        stroke="#2A3848" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 42 26 Q 40 22 44 20 Q 48 18 50 22 Q 52 26 48 28 Q 44 30 42 28"
        stroke="#2A3848" strokeWidth={2} fill="none" strokeLinecap="round" />
      <NeutralMouth cx={32} cy={44} w={10} stroke="#2A3848" />
    </Svg>
  );
}

/** Oily skin — shiny face with oil droplets on surface */
function OilySkinChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={24} fill="#F0D090" />
      <Ellipse cx={22} cy={22} rx={8} ry={6} fill="white" opacity={0.25} />
      <Cheeks lx={20} rx={44} y={38} color="#F0A870" />
      <DotEyes lx={25} rx={39} y={28} r={2.5} fill="#4A2810" />
      <NeutralMouth cx={32} cy={42} w={9} stroke="#4A2810" />
      {[{ x: 44, y: 16 }, { x: 50, y: 26 }, { x: 14, y: 22 }, { x: 12, y: 34 }].map(({ x, y }, i) => (
        <Path key={i}
          d={`M ${x} ${y} C ${x + 3} ${y + 2} ${x + 3} ${y + 6} ${x} ${y + 7} C ${x - 3} ${y + 6} ${x - 3} ${y + 2} ${x} ${y} Z`}
          fill="#F5D040" opacity={0.75} />
      ))}
    </Svg>
  );
}

/** Vaginal irritation — oval with zigzag scratch marks */
function VaginalIrritationChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx={32} cy={34} rx={22} ry={20} fill="#D8A8B8" />
      <Cheeks lx={21} rx={43} y={40} color="#E8C8D8" />
      <DotEyes lx={25} rx={39} y={28} r={2.2} fill="#5A2040" />
      <Path d="M 26 43 Q 30 40 34 43 Q 38 46 42 43" stroke="#5A2040" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 10 28 L 14 24 L 18 28 L 22 24" stroke="#B07090" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 42 20 L 46 16 L 50 20 L 54 16" stroke="#B07090" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Egg-white CM — translucent stretchy droplet */
function CMEggwhiteChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 48 60">
      <Path d="M 24 4 C 30 12 36 22 36 34 C 36 46 30 54 24 54 C 18 54 12 46 12 34 C 12 22 18 12 24 4 Z"
        fill="#D0E8F0" stroke="#80B8D0" strokeWidth={1.2} />
      <Ellipse cx={19} cy={20} rx={5} ry={8} fill="white" opacity={0.3} transform="rotate(-20,19,20)" />
      <Path d="M 22 54 Q 24 60 24 64 Q 24 68 26 64" stroke="#80B8D0" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Medication effective — capsule with checkmark */
function MedEffectiveChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 12 32 A 12 12 0 0 1 12 8 L 36 8 L 36 32 Z" fill="#60A870" />
      <Path d="M 36 8 L 36 32 L 52 32 A 12 12 0 0 0 52 8 Z" fill="#E0E8D8" />
      <Path d="M 18 22 L 26 30 L 46 14" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 12 32 L 52 32 A 12 12 0 0 1 12 56 A 12 12 0 0 1 12 32" fill="#D4C8E8" />
      <Path d="M 22 46 L 42 46" stroke="#9888C0" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Medication NOT effective — capsule with X */
function MedNotEffectiveChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 12 32 A 12 12 0 0 1 12 8 L 36 8 L 36 32 Z" fill="#D85A30" />
      <Path d="M 36 8 L 36 32 L 52 32 A 12 12 0 0 0 52 8 Z" fill="#E0E8D8" />
      <Path d="M 18 14 L 28 26 M 28 14 L 18 26" stroke="white" strokeWidth={3} strokeLinecap="round" />
      <Path d="M 12 32 L 52 32 A 12 12 0 0 1 12 56 A 12 12 0 0 1 12 32" fill="#D4C8E8" />
      <Path d="M 22 46 L 42 46" stroke="#9888C0" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Load-shedding disruption — lightning bolt with strike-through */
function LoadSheddingChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 40 4 L 22 34 L 32 34 L 24 60 L 52 28 L 40 28 Z"
        fill="#C0C0C0" stroke="#909090" strokeWidth={1} strokeLinejoin="round" />
      <Path d="M 8 8 L 56 56" stroke="#D85A30" strokeWidth={5} strokeLinecap="round" />
      <Path d="M 8 8 L 56 56" stroke="white" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Flow drop — simple teardrop for flow-type symptoms in check-in */
function FlowDropChar({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 32 4 C 44 16 54 30 54 42 C 54 56 44 64 32 64 C 20 64 10 56 10 42 C 10 30 20 16 32 4 Z"
        fill="#F07090" stroke="#C25080" strokeWidth={1} />
      <Ellipse cx={22} cy={28} rx={7} ry={10} fill="white" opacity={0.15} transform="rotate(-20,22,28)" />
    </Svg>
  );
}

// ─── Symptom ID → component map ───────────────────────────────────────────────

const CHARACTER_MAP: Record<string, React.ComponentType<{ size: number }>> = {
  // ── Core cycle & hormonal ──
  cramps:              Cramps,
  bloating:            Bloating,
  fatigue:             Fatigue,
  "pelvic-pain":       PelvicPain,
  "pelvic-heaviness":  PelvicHeaviness,
  "sugar-cravings":    SugarCravings,
  "water-retention":   WaterRetention,
  headache:            Headache,
  nausea:              Nausea,
  "breast-tenderness": BreastTenderness,
  "breast-swelling":   BreastSwelling,
  migraine:            Migraine,
  "lower-back-pain":   BackPainChar,
  "upper-back-pain":   BackPainChar,
  dizziness:           DizzinessChar,
  "fatigue-mild":      Fatigue,
  "fatigue-moderate":  Fatigue,
  "fatigue-extreme":   Fatigue,
  "appetite-increase": SugarCravings,
  "appetite-decrease": Fatigue,

  // ── Flow ──
  spotting:            FlowDropChar,
  "flow-light":        FlowDropChar,
  "flow-medium":       FlowDropChar,
  "flow-heavy":        FlowDropChar,
  "clots-small":       FlowDropChar,
  "clots-large":       FlowDropChar,
  "color-bright-red":  FlowDropChar,
  "color-dark-red":    FlowDropChar,
  "color-brown":       FlowDropChar,
  "irregular-bleeding": IrregularCycle,

  // ── Emotional ──
  calm:                 CalmGrounded,
  irritable:            Irritable,
  anxious:              Anxious,
  "low-mood":           LowMood,
  "emotional-sensitivity": Anxious,
  anger:                Irritable,
  tearful:              Tearful,
  "emotional-numbness": LowMood,

  // ── Cognitive ──
  "brain-fog":          BrainFogChar,
  "mental-clarity":     SugarCravings,
  "poor-concentration": DizzinessChar,
  "racing-thoughts":    BrainFogChar,
  "decision-fatigue":   Fatigue,
  "creativity-surge":   OvulationFertility,
  "motivation-boost":   EnergyHighChar,
  "motivation-drop":    LowMood,

  // ── Energy & sleep ──
  "physical-energy-high": EnergyHighChar,
  "physical-energy-low":  Fatigue,
  "social-energy-high":   SugarCravings,
  "social-energy-low":    Fatigue,
  "need-rest":            SleepPoorChar,
  "need-solitude":        Fatigue,
  "desire-to-move":       EnergyHighChar,
  "sleep-quality-good":   SleepGoodChar,
  "sleep-quality-poor":   SleepPoorChar,
  insomnia:               InsomniaChar,
  "early-waking":         InsomniaChar,
  "afternoon-crash":      Fatigue,
  overstimulation:        Anxious,

  // ── Sexual & reproductive ──
  "libido-up":              LibidoUpChar,
  "libido-down":            LibidoDownChar,
  "pain-during-sex":        PelvicPain,
  "vaginal-dryness":        DehydrationChar,
  sensitivity:              VaginalIrritationChar,
  "desire-emotional-intimacy": LibidoUpChar,
  "desire-physical-intimacy":  LibidoUpChar,

  // ── Vaginal & cervical ──
  "cm-dry":          DehydrationChar,
  "cm-sticky":       WaterRetention,
  "cm-creamy":       WaterRetention,
  "cm-eggwhite":     CMEggwhiteChar,
  "vaginal-itching": VaginalIrritationChar,
  "vaginal-burning": Headache,
  "unusual-discharge": VaginalIrritationChar,
  "odor-changes":    VaginalIrritationChar,

  // ── Gut & metabolic ──
  constipation:        ConstipationChar,
  diarrhea:            DiarrheaChar,
  "ibs-symptoms":      Bloating,
  "bloating-after-meals": Bloating,
  "salt-cravings":     SugarCravings,
  "nausea-with-food":  Nausea,
  reflux:              Nausea,
  "food-sensitivity":  Nausea,

  // ── Skin & hair ──
  "acne-skin":      AcneSkin,
  "acne-jawline":   AcneSkin,
  "acne-chin":      AcneSkin,
  "acne-cheeks":    AcneSkin,
  "acne-back":      AcneSkin,
  "acne-chest":     AcneSkin,
  "oily-skin":      OilySkinChar,
  "dry-skin":       DehydrationChar,
  "hair-thinning":  HairThinning,
  "excess-facial-hair": ExcessHair,
  "excess-hair":    ExcessHair,
  "darkened-patches":  SkinDarkening,
  "brittle-nails":  SkinDarkening,
  hives:            FrequentInfectionsChar,

  // ── Pain mapping ──
  "left-ovary-pain":      OvaryPain,
  "right-ovary-pain":     OvaryPain,
  "deep-pelvic-pain":     PelvicPain,
  "rectal-pain":          RectalPainChar,
  "leg-radiating-pain":   LegPainChar,
  "hip-pain":             HipPainChar,
  "pain-bowel-movement":  ConstipationChar,
  "pain-before-period":   PelvicPain,
  "pain-after-period":    PelvicPain,
  "pain-after-sex":       PelvicPain,

  // ── PMOS indicators ──
  "irregular-cycle":      IrregularCycle,
  "irregular-cycles":     IrregularCycle,
  "long-cycles":          IrregularCycle,
  "missed-ovulation":     OvulationFertility,
  "sudden-weight-change": WeightChanges,
  "insulin-resistance":   SugarCravings,
  "reactive-hypoglycemia": SugarCravings,
  "fatigue-after-meals":  Fatigue,
  "blood-sugar-mood":     SugarCravings,
  "skin-darkening":       SkinDarkening,
  "weight-changes":       WeightChanges,
  "ovulation-fertility":  OvulationFertility,

  // ── Endometriosis indicators ──
  "chronic-pelvic-pain":     PelvicPain,
  "pain-outside-period":     PelvicPain,
  "pain-severity-score":     Cramps,
  "medication-effective":    MedEffectiveChar,
  "medication-not-effective": MedNotEffectiveChar,
  "stress-triggered-pain":   StressFlareChar,
  "movement-triggered-pain": HipPainChar,
  "flare-duration":          PelvicPain,

  // ── Immune & stress ──
  "frequent-infections": FrequentInfectionsChar,
  "slow-recovery":       Fatigue,
  "stress-flareups":     StressFlareChar,
  "inflamed-feeling":    HeatFaceChar,
  "heat-intolerance":    HeatFaceChar,
  "cold-sensitivity":    ColdFaceChar,

  // ── Environmental ──
  "weather-sensitivity": WeatherSensitivityChar,
  "heat-exposure":       HeatFaceChar,
  dehydration:           DehydrationChar,
  "physical-labor":      EnergyHighChar,
  "commute-stress":      StressFlareChar,
  "load-shedding":       LoadSheddingChar,
  "financial-stress":    StressFlareChar,
  "caregiving-burden":   Fatigue,

  // ── Spiritual & intuitive ──
  "feeling-intuitive":  FeelingIntuitiveChar,
  "need-reflection":    FeelingIntuitiveChar,
  "desire-grounding":   FeelingIntuitiveChar,
  "feeling-disconnected": LowMood,
  "feeling-aligned":    FeelingIntuitiveChar,
  "emotional-release":  Tearful,
};

export interface SymptomCharacterProps {
  symptomId: string;
  size?: number;
}

export function SymptomCharacter({ symptomId, size = 44 }: SymptomCharacterProps) {
  const Component = CHARACTER_MAP[symptomId];
  if (!Component) return <GenericSymptom size={size} />;
  return <Component size={size} />;
}

export default SymptomCharacter;
