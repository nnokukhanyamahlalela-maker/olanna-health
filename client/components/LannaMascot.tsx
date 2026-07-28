/**
 * LannaMascot — single parametric SVG component for all phase mascots.
 *
 * Construction (per spec §1):
 * - Back ring: 5 larger petal circles (back color) at 0°,72°,144°,216°,288°
 * - Front ring: 5 smaller petal circles (front color) offset 36°
 * - Face centered: eyes, brow, blush, mouth encode phase expression
 *
 * Phase expressions:
 *   menstrual  — sleepy: closed downward-curved eyes, flat neutral mouth
 *   follicular — curious: mismatched eyebrows, one eye glancing aside, small half-smile
 *   ovulation  — bright: sparkle eyes, lifted brows, open grin
 *   luteal     — calm: gentle downward-curved eyes, small closed flat mouth
 */

import React from "react";
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Line,
} from "react-native-svg";
import { Phase } from "@/constants/phaseConfig";
import { phase as phaseTokens } from "@/constants/colors";

export type MascotExpression =
  | "sleepy"
  | "curious"
  | "bright"
  | "calm"
  | "wince";

type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

const PHASE_KEY_MAP: Record<Phase, PhaseKey> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulation: "ovulatory",
  luteal: "luteal",
  late: "luteal",
};

const PHASE_EXPRESSION_MAP: Record<Phase, MascotExpression> = {
  menstrual: "sleepy",
  follicular: "curious",
  ovulation: "bright",
  luteal: "calm",
  late: "calm",
};

function petals(
  cx: number,
  cy: number,
  ringR: number,
  petalR: number,
  fill: string,
  offsetDeg: number,
  opacity = 1
) {
  const els: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const angleDeg = offsetDeg + i * 72;
    const rad = (angleDeg * Math.PI) / 180;
    const px = cx + ringR * Math.cos(rad);
    const py = cy + ringR * Math.sin(rad);
    els.push(
      <Circle
        key={i}
        cx={px}
        cy={py}
        r={petalR}
        fill={fill}
        opacity={opacity}
      />
    );
  }
  return els;
}

function FaceExpression({
  cx,
  cy,
  size,
  expression,
  skinColor,
  inkColor,
}: {
  cx: number;
  cy: number;
  size: number;
  expression: MascotExpression;
  skinColor: string;
  inkColor: string;
}) {
  const s = size;
  // Face circle
  const faceR = s * 0.22;
  // Eye positions
  const eyeOffX = s * 0.065;
  const eyeOffY = s * 0.02;
  const eyeW = s * 0.055;
  const eyeH = s * 0.038;
  const blushR = s * 0.048;
  const blushOffX = s * 0.11;
  const blushOffY = s * 0.065;

  const lx = cx - eyeOffX;
  const rx = cx + eyeOffX;
  const ey = cy - eyeOffY;

  let leftEye: React.ReactNode;
  let rightEye: React.ReactNode;
  let mouth: React.ReactNode;
  let brows: React.ReactNode;

  switch (expression) {
    case "sleepy": {
      // Closed downward-curved eyes (half-ellipse arcs, curved down)
      leftEye = (
        <Path
          d={`M ${lx - eyeW} ${ey} Q ${lx} ${ey + eyeH * 1.4} ${lx + eyeW} ${ey}`}
          stroke={inkColor}
          strokeWidth={s * 0.018}
          fill="none"
          strokeLinecap="round"
        />
      );
      rightEye = (
        <Path
          d={`M ${rx - eyeW} ${ey} Q ${rx} ${ey + eyeH * 1.4} ${rx + eyeW} ${ey}`}
          stroke={inkColor}
          strokeWidth={s * 0.018}
          fill="none"
          strokeLinecap="round"
        />
      );
      // Flat neutral mouth
      mouth = (
        <Line
          x1={cx - s * 0.055}
          y1={cy + s * 0.075}
          x2={cx + s * 0.055}
          y2={cy + s * 0.075}
          stroke={inkColor}
          strokeWidth={s * 0.016}
          strokeLinecap="round"
        />
      );
      // No prominent brows
      brows = null;
      break;
    }
    case "curious": {
      // Eyes glancing to one side (right iris offset leftward)
      const irisR = eyeH * 0.6;
      leftEye = (
        <G>
          <Ellipse cx={lx} cy={ey} rx={eyeW} ry={eyeH} fill={inkColor} />
          <Circle cx={lx - irisR * 0.7} cy={ey - irisR * 0.4} r={irisR * 0.55} fill="white" />
        </G>
      );
      rightEye = (
        <G>
          <Ellipse cx={rx} cy={ey} rx={eyeW} ry={eyeH} fill={inkColor} />
          <Circle cx={rx - irisR * 0.7} cy={ey - irisR * 0.4} r={irisR * 0.55} fill="white" />
        </G>
      );
      // Small closed-lip half-smile
      mouth = (
        <Path
          d={`M ${cx - s * 0.05} ${cy + s * 0.068} Q ${cx} ${cy + s * 0.1} ${cx + s * 0.05} ${cy + s * 0.068}`}
          stroke={inkColor}
          strokeWidth={s * 0.016}
          fill="none"
          strokeLinecap="round"
        />
      );
      // Mismatched brows — left higher
      brows = (
        <G>
          <Path
            d={`M ${lx - eyeW * 0.9} ${ey - eyeH * 2.0} Q ${lx} ${ey - eyeH * 2.7} ${lx + eyeW * 0.9} ${ey - eyeH * 1.8}`}
            stroke={inkColor}
            strokeWidth={s * 0.015}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${rx - eyeW * 0.9} ${ey - eyeH * 1.5} Q ${rx} ${ey - eyeH * 2.0} ${rx + eyeW * 0.9} ${ey - eyeH * 1.5}`}
            stroke={inkColor}
            strokeWidth={s * 0.015}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
      break;
    }
    case "bright": {
      const irisR = eyeH * 0.62;
      leftEye = (
        <G>
          <Ellipse cx={lx} cy={ey} rx={eyeW} ry={eyeH} fill={inkColor} />
          <Circle cx={lx - irisR * 0.45} cy={ey - irisR * 0.55} r={irisR * 0.5} fill="white" />
          <Circle cx={lx + irisR * 0.35} cy={ey - irisR * 0.2} r={irisR * 0.28} fill="white" opacity={0.75} />
        </G>
      );
      rightEye = (
        <G>
          <Ellipse cx={rx} cy={ey} rx={eyeW} ry={eyeH} fill={inkColor} />
          <Circle cx={rx - irisR * 0.45} cy={ey - irisR * 0.55} r={irisR * 0.5} fill="white" />
          <Circle cx={rx + irisR * 0.35} cy={ey - irisR * 0.2} r={irisR * 0.28} fill="white" opacity={0.75} />
        </G>
      );
      // Open grin
      mouth = (
        <Path
          d={`M ${cx - s * 0.07} ${cy + s * 0.058} Q ${cx} ${cy + s * 0.115} ${cx + s * 0.07} ${cy + s * 0.058}`}
          stroke={inkColor}
          strokeWidth={s * 0.016}
          fill={inkColor}
          opacity={0.15}
          strokeLinecap="round"
        />
      );
      // Lifted brows
      brows = (
        <G>
          <Path
            d={`M ${lx - eyeW * 0.9} ${ey - eyeH * 2.2} Q ${lx} ${ey - eyeH * 3.0} ${lx + eyeW * 0.9} ${ey - eyeH * 2.2}`}
            stroke={inkColor}
            strokeWidth={s * 0.015}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${rx - eyeW * 0.9} ${ey - eyeH * 2.2} Q ${rx} ${ey - eyeH * 3.0} ${rx + eyeW * 0.9} ${ey - eyeH * 2.2}`}
            stroke={inkColor}
            strokeWidth={s * 0.015}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
      break;
    }
    case "calm": {
      // Gentle downward-curved eyes (softer arc than sleepy)
      leftEye = (
        <Path
          d={`M ${lx - eyeW * 0.9} ${ey - eyeH * 0.2} Q ${lx} ${ey + eyeH * 1.1} ${lx + eyeW * 0.9} ${ey - eyeH * 0.2}`}
          stroke={inkColor}
          strokeWidth={s * 0.018}
          fill="none"
          strokeLinecap="round"
        />
      );
      rightEye = (
        <Path
          d={`M ${rx - eyeW * 0.9} ${ey - eyeH * 0.2} Q ${rx} ${ey + eyeH * 1.1} ${rx + eyeW * 0.9} ${ey - eyeH * 0.2}`}
          stroke={inkColor}
          strokeWidth={s * 0.018}
          fill="none"
          strokeLinecap="round"
        />
      );
      // Small closed flat mouth
      mouth = (
        <Line
          x1={cx - s * 0.045}
          y1={cy + s * 0.075}
          x2={cx + s * 0.045}
          y2={cy + s * 0.075}
          stroke={inkColor}
          strokeWidth={s * 0.015}
          strokeLinecap="round"
        />
      );
      brows = null;
      break;
    }
    case "wince": {
      // Scrunched shut eyes
      leftEye = (
        <G>
          <Path
            d={`M ${lx - eyeW} ${ey} L ${lx + eyeW} ${ey + eyeH}`}
            stroke={inkColor}
            strokeWidth={s * 0.02}
            strokeLinecap="round"
          />
          <Path
            d={`M ${lx - eyeW} ${ey + eyeH} L ${lx + eyeW} ${ey}`}
            stroke={inkColor}
            strokeWidth={s * 0.016}
            strokeLinecap="round"
            opacity={0.5}
          />
        </G>
      );
      rightEye = (
        <G>
          <Path
            d={`M ${rx - eyeW} ${ey} L ${rx + eyeW} ${ey + eyeH}`}
            stroke={inkColor}
            strokeWidth={s * 0.02}
            strokeLinecap="round"
          />
          <Path
            d={`M ${rx - eyeW} ${ey + eyeH} L ${rx + eyeW} ${ey}`}
            stroke={inkColor}
            strokeWidth={s * 0.016}
            strokeLinecap="round"
            opacity={0.5}
          />
        </G>
      );
      // Downturned open mouth
      mouth = (
        <Path
          d={`M ${cx - s * 0.055} ${cy + s * 0.088} Q ${cx} ${cy + s * 0.06} ${cx + s * 0.055} ${cy + s * 0.088}`}
          stroke={inkColor}
          strokeWidth={s * 0.016}
          fill="none"
          strokeLinecap="round"
        />
      );
      // Furrowed brow
      brows = (
        <G>
          <Path
            d={`M ${lx - eyeW * 0.9} ${ey - eyeH * 1.8} Q ${lx} ${ey - eyeH * 1.3} ${lx + eyeW * 0.9} ${ey - eyeH * 1.8}`}
            stroke={inkColor}
            strokeWidth={s * 0.018}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${rx - eyeW * 0.9} ${ey - eyeH * 1.8} Q ${rx} ${ey - eyeH * 1.3} ${rx + eyeW * 0.9} ${ey - eyeH * 1.8}`}
            stroke={inkColor}
            strokeWidth={s * 0.018}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
      break;
    }
  }

  return (
    <G>
      {/* Face disc */}
      <Circle cx={cx} cy={cy} r={faceR} fill={skinColor} />
      {/* Blush */}
      <Ellipse
        cx={cx - blushOffX}
        cy={cy + blushOffY}
        rx={blushR}
        ry={blushR * 0.65}
        fill="#F06B9A"
        opacity={0.28}
      />
      <Ellipse
        cx={cx + blushOffX}
        cy={cy + blushOffY}
        rx={blushR}
        ry={blushR * 0.65}
        fill="#F06B9A"
        opacity={0.28}
      />
      {brows}
      {leftEye}
      {rightEye}
      {mouth}
    </G>
  );
}

interface LannaMascotProps {
  phase: Phase;
  size?: number;
  expression?: MascotExpression; // override if needed
}

export function LannaMascot({ phase, size = 120, expression }: LannaMascotProps) {
  const pk = PHASE_KEY_MAP[phase];
  const tokens = phaseTokens[pk];
  const expr = expression ?? PHASE_EXPRESSION_MAP[phase];

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Ring radii (relative to size)
  const backRingR = s * 0.3;
  const backPetalR = s * 0.22;
  const frontRingR = s * 0.27;
  const frontPetalR = s * 0.185;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Back petal ring */}
      {petals(cx, cy, backRingR, backPetalR, tokens.back, -90)}
      {/* Front petal ring (offset 36°) */}
      {petals(cx, cy, frontRingR, frontPetalR, tokens.front, -90 + 36)}
      {/* Face */}
      <FaceExpression
        cx={cx}
        cy={cy}
        size={s}
        expression={expr}
        skinColor={tokens.skin}
        inkColor={tokens.ink}
      />
    </Svg>
  );
}

export default LannaMascot;
