import React, { useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";
import * as Haptics from "expo-haptics";

import { useLotusCycle } from "@/hooks/useLotusCycle";
import { phase as phaseTokens, neutral } from "@/constants/colors";
import { Phase } from "@/constants/phaseConfig";
import { storage } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_TOTAL_HEIGHT = 88;

const INACTIVE_COLOR = "#9490C8";
const INACTIVE_LABEL = "#9490C8";

const PHASE_KEY_MAP: Record<Phase, keyof typeof phaseTokens> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulation: "ovulatory",
  luteal: "luteal",
  late: "luteal",
};

// --- Icon components (filled/solid as per spec §5) ---

function CycleIcon({ color, size }: { color: string; size: number }) {
  // Ring/orbit with a small filled dot — represents the cycle phase wheel
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const ringR = s * 0.36;
  const sw = s * 0.13;       // stroke width of ring
  const dotR = s * 0.11;     // dot radius
  // Dot positioned at top-right of ring
  const dotX = cx + ringR * Math.cos((-45 * Math.PI) / 180);
  const dotY = cy + ringR * Math.sin((-45 * Math.PI) / 180);
  // Gap arc: hide a ~70° arc around the dot so the dot "sits on" the ring
  const gapDeg = 70;
  const startAngle = (-45 + gapDeg / 2) * (Math.PI / 180);
  const endAngle  = (-45 - gapDeg / 2 + 360) * (Math.PI / 180);
  const x1 = cx + ringR * Math.cos(startAngle);
  const y1 = cy + ringR * Math.sin(startAngle);
  const x2 = cx + ringR * Math.cos(endAngle);
  const y2 = cy + ringR * Math.sin(endAngle);
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Open arc ring */}
      <Path
        d={`M ${x1} ${y1} A ${ringR} ${ringR} 0 1 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Filled dot on the ring */}
      <Circle cx={dotX} cy={dotY} r={dotR + sw * 0.3} fill={color} />
    </Svg>
  );
}

function CalendarIcon({ color, size }: { color: string; size: number }) {
  const s = size;
  const pad = s * 0.1;
  const r = s * 0.18;
  const headerH = s * 0.28;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Body */}
      <Rect
        x={pad}
        y={pad}
        width={s - pad * 2}
        height={s - pad * 2}
        rx={r}
        fill={color}
      />
      {/* Lighter header band */}
      <Rect
        x={pad}
        y={pad}
        width={s - pad * 2}
        height={headerH}
        rx={r}
        fill="white"
        opacity={0.3}
      />
      {/* Day dots */}
      <Circle cx={s * 0.35} cy={s * 0.62} r={s * 0.065} fill="white" opacity={0.8} />
      <Circle cx={s * 0.65} cy={s * 0.62} r={s * 0.065} fill="white" opacity={0.8} />
      <Circle cx={s * 0.35} cy={s * 0.8} r={s * 0.065} fill="white" opacity={0.5} />
      <Circle cx={s * 0.65} cy={s * 0.8} r={s * 0.065} fill="white" opacity={0.5} />
    </Svg>
  );
}

function CheckInIcon({ color, size }: { color: string; size: number }) {
  // Plain flat 5-petal blossom silhouette, no face
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const ringR = s * 0.31;
  const petalR = s * 0.19;
  const petal2R = s * 0.155;
  const centers: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    centers.push([cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)]);
  }
  const frontCenters: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + 36 + i * 72) * Math.PI) / 180;
    frontCenters.push([cx + ringR * 0.88 * Math.cos(a), cy + ringR * 0.88 * Math.sin(a)]);
  }
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {centers.map(([px, py], i) => (
        <Circle key={`b${i}`} cx={px} cy={py} r={petalR} fill={color} />
      ))}
      {frontCenters.map(([px, py], i) => (
        <Circle key={`f${i}`} cx={px} cy={py} r={petal2R} fill={color} opacity={0.7} />
      ))}
      <Circle cx={cx} cy={cy} r={s * 0.13} fill={color} />
    </Svg>
  );
}

function HealthIcon({ color, size }: { color: string; size: number }) {
  const s = size;
  const cx = s / 2;
  const cy = s * 0.52;
  // Filled heart shape
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Path
        d={`M ${cx} ${cy + s * 0.28}
          C ${cx - s * 0.04} ${cy + s * 0.2} ${cx - s * 0.38} ${cy + s * 0.08} ${cx - s * 0.38} ${cy - s * 0.1}
          C ${cx - s * 0.38} ${cy - s * 0.28} ${cx - s * 0.18} ${cy - s * 0.38} ${cx} ${cy - s * 0.18}
          C ${cx + s * 0.18} ${cy - s * 0.38} ${cx + s * 0.38} ${cy - s * 0.28} ${cx + s * 0.38} ${cy - s * 0.1}
          C ${cx + s * 0.38} ${cy + s * 0.08} ${cx + s * 0.04} ${cy + s * 0.2} ${cx} ${cy + s * 0.28} Z`}
        fill={color}
      />
    </Svg>
  );
}

function LearnIcon({ color, size }: { color: string; size: number }) {
  // Two-column grid icon (two sets of horizontal lines side-by-side)
  const s = size;
  const pad = s * 0.1;
  const w = s - pad * 2;
  const h = s - pad * 2;
  const r = s * 0.14;
  const gutter = s * 0.07;
  const colW = (w - gutter) / 2;
  const lineH = s * 0.055;
  const lineR = lineH / 2;
  const rows = [0.22, 0.44, 0.66, 0.84]; // fraction of h
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Background card */}
      <Rect x={pad} y={pad} width={w} height={h} rx={r} fill={color} />
      {/* Left column lines */}
      {rows.map((frac, i) => (
        <Rect
          key={`l${i}`}
          x={pad + s * 0.06}
          y={pad + h * frac}
          width={colW - s * 0.04}
          height={lineH}
          rx={lineR}
          fill="white"
          opacity={i === 0 ? 0.9 : 0.55}
        />
      ))}
      {/* Right column lines */}
      {rows.map((frac, i) => (
        <Rect
          key={`r${i}`}
          x={pad + colW + gutter + s * 0.02}
          y={pad + h * frac}
          width={colW - s * 0.04}
          height={lineH}
          rx={lineR}
          fill="white"
          opacity={i === 0 ? 0.9 : 0.55}
        />
      ))}
    </Svg>
  );
}

const TAB_LABELS: Record<string, string> = {
  HomeTab: "Cycle",
  CalendarTab: "Calendar",
  CheckInTab: "Check-in",
  HealthTab: "Health",
  LearnTab: "Learn",
};

function TabIcon({
  routeName,
  color,
  size,
}: {
  routeName: string;
  color: string;
  size: number;
}) {
  switch (routeName) {
    case "HomeTab": return <CycleIcon color={color} size={size} />;
    case "CalendarTab": return <CalendarIcon color={color} size={size} />;
    case "CheckInTab": return <CheckInIcon color={color} size={size} />;
    case "HealthTab": return <HealthIcon color={color} size={size} />;
    case "LearnTab": return <LearnIcon color={color} size={size} />;
    default: return <Circle cx={size / 2} cy={size / 2} r={size / 4} fill={color} />;
  }
}

function useCurrentPhaseColor() {
  const [phaseColor, setPhaseColor] = React.useState<string>(phaseTokens.menstrual.front);

  React.useEffect(() => {
    (async () => {
      try {
        const profile = await storage.getUserProfile();
        if (!profile) return;
        // Quick phase estimate from last period start
        if (profile.lastPeriodStart) {
          const start = new Date(profile.lastPeriodStart + "T12:00:00");
          const now = new Date();
          const daysSince = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const cycleDay = (daysSince % (profile.cycleLength || 28)) + 1;
          const cLen = profile.cycleLength || 28;
          const pLen = profile.periodLength || 5;
          let ph: Phase = "menstrual";
          if (cycleDay > pLen && cycleDay <= cLen - 14 - 2) ph = "follicular";
          else if (cycleDay > cLen - 14 - 2 && cycleDay <= cLen - 14 + 1) ph = "ovulation";
          else if (cycleDay > cLen - 14 + 1) ph = "luteal";
          const key = PHASE_KEY_MAP[ph];
          setPhaseColor(phaseTokens[key].front);
        }
      } catch {}
    })();
  }, []);

  return phaseColor;
}

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  activeColor: string;
}

function TabItem({ routeName, isFocused, onPress, onLongPress, activeColor }: TabItemProps) {
  const label = TAB_LABELS[routeName] || routeName;
  const iconColor = isFocused ? activeColor : INACTIVE_COLOR;
  const labelColor = isFocused ? activeColor : INACTIVE_LABEL;
  const pillBg = isFocused ? activeColor + "33" : "transparent";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      testID={`tab-${routeName.toLowerCase()}`}
    >
      <View style={[styles.iconPill, { backgroundColor: pillBg }]}>
        <TabIcon routeName={routeName} color={iconColor} size={26} />
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeColor = useCurrentPhaseColor();

  const renderTabItem = (route: typeof state.routes[0], index: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: "tabLongPress", target: route.key });
    };

    return (
      <TabItem
        key={route.key}
        routeName={route.name}
        isFocused={isFocused}
        onPress={onPress}
        onLongPress={onLongPress}
        activeColor={activeColor}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map(renderTabItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FAF8F3",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#D8D6F0",
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 3,
  },
  iconPill: {
    width: 52,
    height: 44,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
