/**
 * LaunchOverlay — cold-launch splash overlay
 *
 * Renders as an absoluteFill sibling on top of NavigationContainer.
 * The navigator is already at the correct screen (Main or Onboarding)
 * underneath; the overlay simply covers it, animates, then unmounts.
 *
 * Animation sequence
 * ──────────────────
 *   0  ms        Mint circle pops in  (spring scale 0.4 → 1, opacity fade)
 *   200 ms       Coral circle pops in
 *   400 ms       Cream circle pops in
 *   600 ms       Lavender circle pops in
 *   ~1 000 ms    All dots settled — hold
 *   1 800 ms     Overlay begins to fade out (500 ms ease-out)
 *   2 300 ms     onComplete() → parent unmounts
 *
 * Dot layout mirrors the app icon exactly (positions as fractions of
 * the square side so it scales to any screen size).
 */

import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";

// ── Brand colours ──────────────────────────────────────────────────────────────
const NAVY    = "#1A1730"; // dark navy — matches app-icon background
const MINT    = "#5BCFB2"; // mint / teal green
const CORAL   = "#D85A30"; // burnt-orange / coral  (= brand CTA colour)
const CREAM   = "#F5F0E8"; // off-white / cream
const LAVENDER = "#C4BFEC"; // pale lavender

// ── Dot definitions (positions mirror the icon layout) ─────────────────────────
// cxP / cyP : centre as a fraction of screen width / height
// rP        : radius as a fraction of Math.min(screenW, screenH)
const DOT_DEFS = [
  { color: MINT,     cxP: 0.323, cyP: 0.664, rP: 0.151, delay:   0 },
  { color: CORAL,    cxP: 0.445, cyP: 0.742, rP: 0.137, delay: 200 },
  { color: CREAM,    cxP: 0.498, cyP: 0.469, rP: 0.073, delay: 400 },
  { color: LAVENDER, cxP: 0.664, cyP: 0.254, rP: 0.186, delay: 600 },
] as const;

// ── Single animated circle ─────────────────────────────────────────────────────
interface DotProps {
  cx: number; cy: number; r: number; color: string;
  opacity: SharedValue<number>; scale: SharedValue<number>;
}
function AnimatedDot({ cx, cy, r, color, opacity, scale }: DotProps) {
  const style = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const size = r * 2;
  return (
    <Animated.View
      style={[
        {
          position:        "absolute",
          left:            cx - r,
          top:             cy - r,
          width:           size,
          height:          size,
          borderRadius:    r,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// ── Public component ──────────────────────────────────────────────────────────
interface LaunchOverlayProps {
  onComplete: () => void;
}

export function LaunchOverlay({ onComplete }: LaunchOverlayProps) {
  const { width: W, height: H } = useWindowDimensions();
  const unit = Math.min(W, H); // radius scale unit

  // Four dots — each needs its own opacity + scale shared values.
  // Declared at top level (no loops) to satisfy React hook rules.
  const op0 = useSharedValue(0), sc0 = useSharedValue(0.4);
  const op1 = useSharedValue(0), sc1 = useSharedValue(0.4);
  const op2 = useSharedValue(0), sc2 = useSharedValue(0.4);
  const op3 = useSharedValue(0), sc3 = useSharedValue(0.4);
  const overlayOp = useSharedValue(1);

  useEffect(() => {
    // Helper: pop-in for each dot
    const pop = (
      opSV:    SharedValue<number>,
      scaleSV: SharedValue<number>,
      delay:   number,
    ) => {
      opSV.value    = withDelay(delay, withTiming(1,  { duration: 260 }));
      scaleSV.value = withDelay(
        delay,
        withSpring(1, { damping: 13, stiffness: 210, mass: 0.65 }),
      );
    };

    pop(op0, sc0,   0);
    pop(op1, sc1, 200);
    pop(op2, sc2, 400);
    pop(op3, sc3, 600);

    // Last dot pops at 600 ms; spring settles in ~400 ms → hold until 1800 ms
    // then ease-out fade over 500 ms.
    overlayOp.value = withDelay(
      1800,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }, (done) => {
        if (done) runOnJS(onComplete)();
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));

  const dots = [
    { def: DOT_DEFS[0], op: op0, sc: sc0 },
    { def: DOT_DEFS[1], op: op1, sc: sc1 },
    { def: DOT_DEFS[2], op: op2, sc: sc2 },
    { def: DOT_DEFS[3], op: op3, sc: sc3 },
  ];

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, overlayStyle]}>
      {dots.map(({ def, op, sc }, i) => (
        <AnimatedDot
          key={i}
          cx={def.cxP * W}
          cy={def.cyP * H}
          r={def.rP * unit}
          color={def.color}
          opacity={op}
          scale={sc}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: NAVY,
    zIndex:          9999,
    elevation:       9999,
  },
});
