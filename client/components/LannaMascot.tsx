/**
 * LannaMascot — Gen Z rebrand
 *
 * Four phase states, each changing petal colour, size, and angle:
 *   Menstrual  = Bud       — small muted-lavender petals, resting face (closed eyes, flat mouth)
 *   Follicular = Opening   — medium soft-coral petals, alert face (gentle smile)
 *   Ovulatory  = Full bloom — largest saturated-coral petals, bright face (full smile + glint)
 *   Luteal     = Settling  — medium soft-teal petals, slight rotation for droop, calm face
 *
 * Face ink is always deep plum #26215C so Lanna is recognisable across all phases.
 * Only petal colour, petal size, and rotation change.
 */

import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";
import Svg, { Circle, Path, G, Ellipse } from "react-native-svg";
import { Phase } from "@/constants/phaseConfig";

export type MascotExpression = "sleepy" | "curious" | "bright" | "calm" | "wince";

const INK = "#26215C"; // deep plum — always used for eyes and mouth

interface PhaseMascotConfig {
  backColor:       string;
  frontColor:      string;
  backRingRatio:   number; // × size
  backPetalRatio:  number;
  frontRingRatio:  number;
  frontPetalRatio: number;
  petalOpacity:    number;
  rotateOffset:    number; // extra degrees — creates droop for luteal
  expression:      MascotExpression;
  skinColor:       string;
}

const PHASE_CONFIG: Record<string, PhaseMascotConfig> = {
  menstrual: {
    // Bud: small, closed, muted lavender
    backColor:       "#9490C8",
    frontColor:      "#B8B4E8",
    backRingRatio:   0.27,
    backPetalRatio:  0.145,
    frontRingRatio:  0.20,
    frontPetalRatio: 0.105,
    petalOpacity:    1,
    rotateOffset:    0,
    expression:      "sleepy",
    skinColor:       "#E8E6F8",
  },
  follicular: {
    // Opening: medium, soft coral
    backColor:       "#C07848",
    frontColor:      "#E8A070",
    backRingRatio:   0.34,
    backPetalRatio:  0.185,
    frontRingRatio:  0.26,
    frontPetalRatio: 0.135,
    petalOpacity:    1,
    rotateOffset:    0,
    expression:      "curious",
    skinColor:       "#FAE8DC",
  },
  ovulation: {
    // Full bloom: largest, saturated coral — most vibrant
    backColor:       "#B04020",
    frontColor:      "#D85A30",
    backRingRatio:   0.41,
    backPetalRatio:  0.225,
    frontRingRatio:  0.31,
    frontPetalRatio: 0.165,
    petalOpacity:    1,
    rotateOffset:    0,
    expression:      "bright",
    skinColor:       "#FAE0D0",
  },
  luteal: {
    // Settling: medium, soft teal, drooped 16° rotation, lower opacity
    backColor:       "#4A9080",
    frontColor:      "#7ABFB0",
    backRingRatio:   0.32,
    backPetalRatio:  0.170,
    frontRingRatio:  0.245,
    frontPetalRatio: 0.122,
    petalOpacity:    0.72,
    rotateOffset:    16,
    expression:      "calm",
    skinColor:       "#D8F0EC",
  },
};

// ─── Petal ring renderer ──────────────────────────────────────────────────────

function PetalRing({
  cx, cy, ringR, petalR, fill, baseOffsetDeg, extraRotation, opacity,
}: {
  cx: number; cy: number; ringR: number; petalR: number;
  fill: string; baseOffsetDeg: number; extraRotation: number; opacity: number;
}) {
  const petals: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const angleDeg = baseOffsetDeg + extraRotation + i * 72;
    const rad = (angleDeg * Math.PI) / 180;
    const px = cx + ringR * Math.cos(rad);
    const py = cy + ringR * Math.sin(rad);
    petals.push(
      <Circle key={i} cx={px} cy={py} r={petalR} fill={fill} opacity={opacity} />
    );
  }
  return <G>{petals}</G>;
}

// ─── Face expressions ─────────────────────────────────────────────────────────

function FaceExpression({
  cx, cy, size, expression, skinColor,
}: {
  cx: number; cy: number; size: number;
  expression: MascotExpression; skinColor: string;
}) {
  const faceR    = size * 0.21;
  const eyeOffX  = size * 0.062;
  const eyeOffY  = size * 0.015;
  const eyeR     = size * 0.028;
  const lineW    = size * 0.048; // half-width of closed-eye line
  const lx       = cx - eyeOffX;
  const rx       = cx + eyeOffX;
  const ey       = cy - eyeOffY;
  const mouthY   = cy + size * 0.075;
  const sw       = size * 0.015;  // stroke width

  let leftEye:  React.ReactNode;
  let rightEye: React.ReactNode;
  let mouth:    React.ReactNode;

  switch (expression) {

    // ── Menstrual: sleepy ─────────────────────────────────────────────────────
    case "sleepy": {
      // Two horizontal line segments (eyes closed)
      leftEye = (
        <Path
          d={`M ${lx - lineW} ${ey} L ${lx + lineW} ${ey}`}
          stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" fill="none"
        />
      );
      rightEye = (
        <Path
          d={`M ${rx - lineW} ${ey} L ${rx + lineW} ${ey}`}
          stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" fill="none"
        />
      );
      // Flat neutral mouth
      mouth = (
        <Path
          d={`M ${cx - size * 0.042} ${mouthY} L ${cx + size * 0.042} ${mouthY}`}
          stroke={INK} strokeWidth={sw} strokeLinecap="round" fill="none"
        />
      );
      break;
    }

    // ── Follicular: curious ───────────────────────────────────────────────────
    case "curious": {
      // One eye slightly higher (raised brow feel), gentle upturn mouth
      leftEye  = <Circle cx={lx} cy={ey - size * 0.008} r={eyeR} fill={INK} />;
      rightEye = <Circle cx={rx} cy={ey}                 r={eyeR * 0.85} fill={INK} />;
      mouth = (
        <Path
          d={`M ${cx - size * 0.044} ${mouthY} Q ${cx} ${mouthY + size * 0.026} ${cx + size * 0.044} ${mouthY}`}
          stroke={INK} strokeWidth={sw} strokeLinecap="round" fill="none"
        />
      );
      break;
    }

    // ── Ovulatory: bright ─────────────────────────────────────────────────────
    case "bright": {
      // Larger dots with a white glint, wide confident smile
      leftEye = (
        <G>
          <Circle cx={lx} cy={ey} r={eyeR * 1.18} fill={INK} />
          <Circle cx={lx + eyeR * 0.44} cy={ey - eyeR * 0.44} r={eyeR * 0.36} fill={skinColor} />
        </G>
      );
      rightEye = (
        <G>
          <Circle cx={rx} cy={ey} r={eyeR * 1.18} fill={INK} />
          <Circle cx={rx + eyeR * 0.44} cy={ey - eyeR * 0.44} r={eyeR * 0.36} fill={skinColor} />
        </G>
      );
      mouth = (
        <Path
          d={`M ${cx - size * 0.056} ${mouthY - size * 0.006} Q ${cx} ${mouthY + size * 0.044} ${cx + size * 0.056} ${mouthY - size * 0.006}`}
          stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" fill="none"
        />
      );
      break;
    }

    // ── Luteal: calm (default) ────────────────────────────────────────────────
    default:
    case "calm": {
      // Smaller dots, barely-there upturn
      leftEye  = <Circle cx={lx} cy={ey} r={eyeR * 0.84} fill={INK} />;
      rightEye = <Circle cx={rx} cy={ey} r={eyeR * 0.84} fill={INK} />;
      mouth = (
        <Path
          d={`M ${cx - size * 0.036} ${mouthY} Q ${cx} ${mouthY + size * 0.016} ${cx + size * 0.036} ${mouthY}`}
          stroke={INK} strokeWidth={sw * 0.9} strokeLinecap="round" fill="none"
        />
      );
      break;
    }
  }

  return (
    <G>
      {/* Face circle */}
      <Circle cx={cx} cy={cy} r={faceR} fill={skinColor} />
      {/* Subtle blush */}
      <Ellipse cx={cx - size * 0.105} cy={cy + size * 0.055} rx={size * 0.036} ry={size * 0.020} fill={INK} opacity={0.07} />
      <Ellipse cx={cx + size * 0.105} cy={cy + size * 0.055} rx={size * 0.036} ry={size * 0.020} fill={INK} opacity={0.07} />
      {leftEye}
      {rightEye}
      {mouth}
    </G>
  );
}

// ─── Inner SVG renderer (pure, no animation logic) ───────────────────────────

function MascotSvg({ cfg, size }: { cfg: PhaseMascotConfig; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Back ring (deeper colour, larger petals) */}
      <PetalRing
        cx={cx} cy={cy}
        ringR={cfg.backRingRatio * size}
        petalR={cfg.backPetalRatio * size}
        fill={cfg.backColor}
        baseOffsetDeg={-90}
        extraRotation={cfg.rotateOffset}
        opacity={cfg.petalOpacity}
      />
      {/* Front ring (lighter colour, smaller petals, offset 36°) */}
      <PetalRing
        cx={cx} cy={cy}
        ringR={cfg.frontRingRatio * size}
        petalR={cfg.frontPetalRatio * size}
        fill={cfg.frontColor}
        baseOffsetDeg={-90 + 36}
        extraRotation={cfg.rotateOffset}
        opacity={cfg.petalOpacity}
      />
      {/* Face — ink always deep plum */}
      <FaceExpression
        cx={cx} cy={cy}
        size={size}
        expression={cfg.expression}
        skinColor={cfg.skinColor}
      />
    </Svg>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface LannaMascotProps {
  phase:       Phase;
  size?:       number;
  /** Kept for API compatibility — phase drives the expression in the new design. */
  expression?: MascotExpression;
}

function resolveKey(phase: Phase): string {
  if (phase === "late")      return "luteal";
  if (phase === "ovulation") return "ovulation";
  return phase;
}

export function LannaMascot({ phase, size = 100 }: LannaMascotProps) {
  const reducedMotion  = useReducedMotion();

  // Current config
  const cfg            = PHASE_CONFIG[resolveKey(phase)] ?? PHASE_CONFIG.menstrual;

  // Track the previous phase config so we can crossfade from it
  const prevCfgRef     = useRef<PhaseMascotConfig>(cfg);
  const prevPhaseRef   = useRef<Phase>(phase);

  // 0 = fully prev, 1 = fully current
  const fadeProgress   = useSharedValue(1);

  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      // Snapshot the outgoing config before updating the ref
      prevCfgRef.current   = PHASE_CONFIG[resolveKey(prevPhaseRef.current)] ?? PHASE_CONFIG.menstrual;
      prevPhaseRef.current = phase;

      if (!reducedMotion) {
        // Jump to 0 (show prev) then animate to 1 (show curr)
        fadeProgress.value = 0;
        fadeProgress.value = withTiming(1, { duration: 1100 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const prevStyle = useAnimatedStyle(() => ({ opacity: 1 - fadeProgress.value }));
  const currStyle = useAnimatedStyle(() => ({ opacity: fadeProgress.value }));

  return (
    <View style={{ width: size, height: size }}>
      {/* Outgoing phase — fades out on phase change */}
      <Animated.View style={[{ position: "absolute" }, prevStyle]} pointerEvents="none">
        <MascotSvg cfg={prevCfgRef.current} size={size} />
      </Animated.View>
      {/* Incoming / current phase — fades in */}
      <Animated.View style={[{ position: "absolute" }, currStyle]}>
        <MascotSvg cfg={cfg} size={size} />
      </Animated.View>
    </View>
  );
}

export default LannaMascot;
