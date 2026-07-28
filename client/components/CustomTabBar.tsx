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

const INACTIVE_COLOR = "#9B9993";
const INACTIVE_LABEL = "#9B9993";

const PHASE_KEY_MAP: Record<Phase, keyof typeof phaseTokens> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulation: "ovulatory",
  luteal: "luteal",
  late: "luteal",
};

// --- Icon components (filled/solid as per spec §5) ---

function CycleIcon({ color, size }: { color: string; size: number }) {
  // Filled 5-petal blossom with white center dot
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const ringR = s * 0.3;
  const petalR = s * 0.18;
  const petal2R = s * 0.15;
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
        <Circle key={`f${i}`} cx={px} cy={py} r={petal2R} fill={color} opacity={0.75} />
      ))}
      <Circle cx={cx} cy={cy} r={s * 0.14} fill="white" />
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
  const s = size;
  const padX = s * 0.15;
  const padY = s * 0.1;
  const w = s - padX * 2;
  const h = s - padY * 2;
  const spineX = padX + w * 0.38;
  const r = s * 0.12;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Book body */}
      <Rect x={padX} y={padY} width={w} height={h} rx={r} fill={color} />
      {/* Spine line */}
      <Rect x={spineX} y={padY} width={s * 0.045} height={h} fill="white" opacity={0.35} />
      {/* Page lines on right half */}
      <Line
        x1={spineX + s * 0.1}
        y1={padY + h * 0.32}
        x2={padX + w - s * 0.06}
        y2={padY + h * 0.32}
        stroke="white"
        strokeWidth={s * 0.05}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Line
        x1={spineX + s * 0.1}
        y1={padY + h * 0.55}
        x2={padX + w - s * 0.1}
        y2={padY + h * 0.55}
        stroke="white"
        strokeWidth={s * 0.05}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Line
        x1={spineX + s * 0.1}
        y1={padY + h * 0.73}
        x2={padX + w - s * 0.14}
        y2={padY + h * 0.73}
        stroke="white"
        strokeWidth={s * 0.05}
        strokeLinecap="round"
        opacity={0.4}
      />
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
  const [phaseColor, setPhaseColor] = React.useState(phaseTokens.menstrual.front);

  React.useEffect(() => {
    (async () => {
      try {
        const profile = await storage.getUserProfile();
        if (!profile) return;
        // Quick phase estimate from last period start
        if (profile.lastPeriodStart) {
          const start = new Date(profile.lastPeriodStart);
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
        <TabIcon routeName={routeName} color={iconColor} size={24} />
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EDD8E7",
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
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
