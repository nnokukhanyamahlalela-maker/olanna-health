/**
 * QuickLogMascot
 * Four illustrated SVG mascot cards for the home screen quick log row.
 * Matches the reference mockup: Flow (blue teardrop), Mood (red heart),
 * Pain (bandage), Energy (lightning bolt).
 */

import React from "react";
import Svg, {
  Path, Ellipse, Circle, Line, Rect, G,
} from "react-native-svg";

interface MascotProps {
  size: number;
}

// ─── Shared kawaii face helpers ───────────────────────────────────────────────

/** Closed/sleepy eyes — two arcs curving up (∩ shape) */
function SleepyEyes({ lx, rx, y, stroke = "#2D1A1A" }: {
  lx: number; rx: number; y: number; stroke?: string;
}) {
  return (
    <>
      <Path
        d={`M ${lx - 5} ${y} Q ${lx} ${y - 5} ${lx + 5} ${y}`}
        stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
      <Path
        d={`M ${rx - 5} ${y} Q ${rx} ${y - 5} ${rx + 5} ${y}`}
        stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
    </>
  );
}

/** Happy dot eyes with highlight */
function HappyEyes({ lx, rx, y, r = 3, stroke = "#2D1A1A" }: {
  lx: number; rx: number; y: number; r?: number; stroke?: string;
}) {
  return (
    <>
      <Circle cx={lx} cy={y} r={r} fill={stroke} />
      <Circle cx={rx} cy={y} r={r} fill={stroke} />
      <Circle cx={lx + 1} cy={y - 1} r={1} fill="white" />
      <Circle cx={rx + 1} cy={y - 1} r={1} fill="white" />
    </>
  );
}

/** Rosy cheeks */
function Cheeks({ lx, rx, y, stroke = "#F5A8C0" }: {
  lx: number; rx: number; y: number; stroke?: string;
}) {
  return (
    <>
      <Ellipse cx={lx} cy={y} rx={7} ry={4.5} fill={stroke} opacity={0.65} />
      <Ellipse cx={rx} cy={y} rx={7} ry={4.5} fill={stroke} opacity={0.65} />
    </>
  );
}

/** Simple smile */
function Smile({ cx, cy, w = 10, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return (
    <Path
      d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + 5} ${cx + w / 2} ${cy}`}
      stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round"
    />
  );
}

/** Neutral/flat mouth */
function NeutralMouth({ cx, cy, w = 8, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return (
    <Line
      x1={cx - w / 2} y1={cy} x2={cx + w / 2} y2={cy}
      stroke={stroke} strokeWidth={2} strokeLinecap="round"
    />
  );
}

/** Pained frown */
function Frown({ cx, cy, w = 10, stroke = "#2D1A1A" }: {
  cx: number; cy: number; w?: number; stroke?: string;
}) {
  return (
    <Path
      d={`M ${cx - w / 2} ${cy + 4} Q ${cx} ${cy} ${cx + w / 2} ${cy + 4}`}
      stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round"
    />
  );
}

// ─── Flow — blue teardrop, sleepy ─────────────────────────────────────────────

export function FlowMascot({ size }: MascotProps) {
  // Viewbox 64×72 — teardrop taller than wide
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 64 72">
      {/* Teardrop body: narrow at top, round at bottom */}
      <Path
        d="M 32 4 C 48 16, 58 32, 58 46 C 58 59, 46 68, 32 68 C 18 68, 6 59, 6 46 C 6 32, 16 16, 32 4 Z"
        fill="#5AABD4"
      />
      {/* Subtle highlight top-left */}
      <Ellipse cx={22} cy={24} rx={7} ry={10} fill="white" opacity={0.15} transform="rotate(-30,22,24)" />
      {/* Cheeks */}
      <Cheeks lx={20} rx={44} y={52} />
      {/* Sleepy eyes */}
      <SleepyEyes lx={24} rx={40} y={42} />
      {/* Neutral mouth */}
      <NeutralMouth cx={32} cy={58} w={10} />
    </Svg>
  );
}

// ─── Mood — red heart, happy ──────────────────────────────────────────────────

export function MoodMascot({ size }: MascotProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      {/* Heart body */}
      <Path
        d="M 36 62 C 16 48, 4 36, 4 24 C 4 14, 13 7, 22 7 C 28 7, 34 10, 36 15 C 38 10, 44 7, 50 7 C 59 7, 68 14, 68 24 C 68 36, 56 48, 36 62 Z"
        fill="#E8445E"
      />
      {/* Top-left highlight */}
      <Path
        d="M 18 14 C 13 19, 11 26, 14 32"
        stroke="#F07090"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        opacity={0.4}
      />
      {/* Cheeks (lighter pink on dark red) */}
      <Cheeks lx={22} rx={50} y={42} stroke="#F9C0D0" />
      {/* Happy eyes */}
      <HappyEyes lx={26} rx={46} y={34} r={3.5} />
      {/* Smile */}
      <Smile cx={36} cy={48} w={14} />
    </Svg>
  );
}

// ─── Pain — bandage, pained face ─────────────────────────────────────────────

export function PainMascot({ size }: MascotProps) {
  // Bandage: horizontal oval, 88×52 viewbox
  return (
    <Svg width={size * 1.3} height={size * 0.8} viewBox="0 0 88 52">
      {/* Outer bandage (tan rounded ends) */}
      <Rect x={2} y={8} width={84} height={36} rx={18} ry={18} fill="#D4A882" />
      {/* White center strip */}
      <Rect x={26} y={5} width={36} height={42} rx={5} ry={5} fill="#F8F4F0" />
      {/* Red cross lines on left pad */}
      <Line x1={13} y1={20} x2={13} y2={32} stroke="#CC4040" strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={7} y1={26} x2={19} y2={26} stroke="#CC4040" strokeWidth={3.5} strokeLinecap="round" />
      {/* Red cross lines on right pad */}
      <Line x1={75} y1={20} x2={75} y2={32} stroke="#CC4040" strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={69} y1={26} x2={81} y2={26} stroke="#CC4040" strokeWidth={3.5} strokeLinecap="round" />
      {/* Pained face in white center */}
      {/* Worried brow lines */}
      <Path d="M 35 16 Q 38 14 41 16" stroke="#8B5E40" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M 47 16 Q 50 14 53 16" stroke="#8B5E40" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* Eyes — pained: closed tight arcs pointing DOWN */}
      <Path d="M 34 22 Q 38 26 42 22" stroke="#8B5E40" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 46 22 Q 50 26 54 22" stroke="#8B5E40" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* Tear drops */}
      <Ellipse cx={38} cy={28} rx={1.5} ry={2} fill="#89B8D4" opacity={0.8} />
      <Ellipse cx={50} cy={28} rx={1.5} ry={2} fill="#89B8D4" opacity={0.8} />
      {/* Frown */}
      <Frown cx={44} cy={34} w={10} stroke="#8B5E40" />
    </Svg>
  );
}

// ─── Energy — yellow lightning bolt, happy ────────────────────────────────────

export function EnergyMascot({ size }: MascotProps) {
  return (
    <Svg width={size * 0.85} height={size} viewBox="0 0 54 72">
      {/* Lightning bolt body */}
      <Path
        d="M 42 3 L 14 38 L 28 38 L 10 69 L 48 30 L 34 30 Z"
        fill="#F5B800"
      />
      {/* Edge shadow/depth */}
      <Path
        d="M 42 3 L 14 38 L 28 38 L 10 69 L 48 30 L 34 30 Z"
        fill="none"
        stroke="#D49A00"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Face positioned in middle of bolt */}
      {/* Cheeks */}
      <Cheeks lx={21} rx={35} y={52} stroke="#F9A8C0" />
      {/* Happy eyes */}
      <HappyEyes lx={22} rx={34} y={45} r={2.5} />
      {/* Smile */}
      <Smile cx={28} cy={56} w={10} />
    </Svg>
  );
}

// ─── Export map ───────────────────────────────────────────────────────────────

export const QUICK_LOG_MASCOTS = {
  flow: FlowMascot,
  mood: MoodMascot,
  pain: PainMascot,
  energy: EnergyMascot,
} as const;
