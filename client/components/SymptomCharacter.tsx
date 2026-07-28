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

// ─── Symptom ID → component map ───────────────────────────────────────────────

const CHARACTER_MAP: Record<string, React.ComponentType<{ size: number }>> = {
  // Physical / hormonal
  cramps: Cramps,
  bloating: Bloating,
  fatigue: Fatigue,
  "pelvic-pain": PelvicPain,
  "pelvic-heaviness": PelvicHeaviness,
  "sugar-cravings": SugarCravings,
  "water-retention": WaterRetention,
  headache: Headache,
  nausea: Nausea,
  "breast-tenderness": BreastTenderness,
  "breast-swelling": BreastSwelling,
  migraine: Migraine,

  // PMOS indicators
  "excess-hair": ExcessHair,
  "excess-facial-hair": ExcessHair,
  "hair-thinning": HairThinning,
  "acne-skin": AcneSkin,
  "acne-jawline": AcneSkin,
  "acne-chin": AcneSkin,
  "irregular-cycle": IrregularCycle,
  "irregular-cycles": IrregularCycle,
  "long-cycles": IrregularCycle,
  "skin-darkening": SkinDarkening,
  "weight-changes": WeightChanges,
  "ovulation-fertility": OvulationFertility,
  "fatigue-after-meals": Fatigue,
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
