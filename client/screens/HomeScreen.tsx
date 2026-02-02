import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from "react-native-svg";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { AppGradient } from "@/components/AppGradient";
import { CyclePhase, Lotus } from "@/components/Lotus";
import { Spacing, ScreenPadding, PillSpacing } from "@/constants/spacing";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PHASE_TITLES: Record<CyclePhase, string> = {
  menstrual: "MENSTRUAL",
  follicular: "FOLLICULAR",
  ovulation: "OVULATION",
  luteal: "LUTEAL",
};

const PHASE_SUBTITLES: Record<CyclePhase, string> = {
  menstrual: "Rest & Release",
  follicular: "Growth & Renewal",
  ovulation: "Rise & Shine",
  luteal: "Turn Inward",
};

const PHASE_GRADIENT_COLORS = {
  menstrual: { start: "#C8A8D4", end: "#E8C4D8" },
  follicular: { start: "#E8C4D8", end: "#D4B8C0" },
  ovulation: { start: "#F4D0A8", end: "#F8B888" },
  luteal: { start: "#E888A8", end: "#D868A0" },
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <View style={styles.weekCalendar}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, idx) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText
              style={[
                styles.weekdayLabel,
                isSelected(weekDates[idx]) && styles.weekdayLabelSelected,
              ]}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.datesRow}>
        {weekDates.map((date, idx) => {
          const selected = isSelected(date);
          return (
            <Pressable
              key={idx}
              style={styles.dateCell}
              onPress={() => onSelectDate(date)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${date.toDateString()}`}
            >
              {selected ? (
                <LinearGradient
                  colors={["#F8A8C8", "#FF8858"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.datePillGradient}
                >
                  <ThemedText style={styles.dateTextSelected}>
                    {date.getDate()}
                  </ThemedText>
                </LinearGradient>
              ) : (
                <View style={styles.datePill}>
                  <ThemedText style={styles.dateText}>
                    {date.getDate()}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface CycleRingProps {
  phase: CyclePhase;
  currentDay: number;
  cycleLength: number;
}

function CycleRing({ phase, currentDay, cycleLength }: CycleRingProps) {
  const size = Math.min(SCREEN_WIDTH - 80, 280);
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const menstrualEnd = 0.18;
  const follicularEnd = 0.46;
  const ovulationEnd = 0.54;

  const todayAngle = ((currentDay - 1) / cycleLength) * 360;
  const todayPos = polarToCartesian(cx, cy, radius, todayAngle);

  return (
    <View style={[styles.cycleRingContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="menstrualGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#C8A8D4" />
            <Stop offset="100%" stopColor="#E8C4D8" />
          </SvgLinearGradient>
          <SvgLinearGradient id="follicularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E8C4D8" />
            <Stop offset="100%" stopColor="#D4B8C0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="ovulationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F4D0A8" />
            <Stop offset="100%" stopColor="#F8B888" />
          </SvgLinearGradient>
          <SvgLinearGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E888A8" />
            <Stop offset="100%" stopColor="#D868A0" />
          </SvgLinearGradient>
        </Defs>

        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#menstrualGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * menstrualEnd} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#follicularGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (follicularEnd - menstrualEnd)} ${circumference}`}
          strokeDashoffset={-circumference * menstrualEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#ovulationGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (ovulationEnd - follicularEnd)} ${circumference}`}
          strokeDashoffset={-circumference * follicularEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#lutealGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * (1 - ovulationEnd)} ${circumference}`}
          strokeDashoffset={-circumference * ovulationEnd}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />

        <G>
          <Circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={10}
            fill="white"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
          <Circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={5}
            fill="#E888A8"
          />
        </G>
      </Svg>

      <View style={styles.cycleCenter}>
        <View style={styles.lotusWrapper}>
          <Lotus
            phase={phase}
            size={80}
            strokeColor="rgba(255,255,255,0.85)"
            strokeWidth={1.2}
          />
        </View>
        <ThemedText style={styles.phaseTitle}>{PHASE_TITLES[phase]}</ThemedText>
        <ThemedText style={styles.dayNumber}>{currentDay}</ThemedText>
        <ThemedText style={styles.phaseSubtitle}>{PHASE_SUBTITLES[phase]}</ThemedText>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = useMemo(() => {
    return selectedDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const userProfile = await storage.getUserProfile();
      setProfile(userProfile);
      if (userProfile) {
        const cycle = calculateCycleData(userProfile);
        setCycleData(cycle);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  if (isLoading) {
    return (
      <AppGradient style={styles.fullScreen}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </AppGradient>
    );
  }

  if (!profile || !cycleData) {
    return (
      <AppGradient style={styles.fullScreen}>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <EmptyState
            image={require("../../assets/images/empty-cycle.png")}
            title="Begin Your Wellness Journey"
            description="Set up your profile to track your cycle and receive personalized insights."
            actionLabel="Get Started"
            onAction={() => navigation.navigate("Onboarding")}
          />
        </View>
      </AppGradient>
    );
  }

  return (
    <AppGradient style={styles.fullScreen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.monthTitle}>{currentMonth}</ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileButton}
            testID="profile-button"
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Feather name="user" size={20} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <View style={styles.mainCardWrapper}>
          <BlurView intensity={40} tint="light" style={styles.mainCard}>
            <View style={styles.cardInner}>
              <CycleRing
                phase={cycleData.phase}
                currentDay={cycleData.currentDay}
                cycleLength={cycleData.cycleLength}
              />

              <View style={styles.dayCounter}>
                <ThemedText style={styles.dayCounterText}>
                  Day {cycleData.currentDay} of {cycleData.cycleLength}
                </ThemedText>
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.brandFooter}>
          <ThemedText style={styles.brandName}>
            <ThemedText style={styles.brandBold}>OLANNA</ThemedText>
            {" "}
            <ThemedText style={styles.brandLight}>HEALTH</ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  monthTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.5,
  },
  profileButton: {
    width: PillSpacing.minTapTarget,
    height: PillSpacing.minTapTarget,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  weekCalendar: {
    marginBottom: Spacing.xl,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
  },
  weekdayLabelSelected: {
    color: "#F8A8C8",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dateCell: {
    flex: 1,
    alignItems: "center",
  },
  datePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  datePillGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  dateTextSelected: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  mainCardWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  mainCard: {
    borderRadius: 28,
    overflow: "hidden",
  },
  cardInner: {
    padding: Spacing.xl,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cycleRingContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cycleCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  lotusWrapper: {
    marginBottom: Spacing.sm,
    opacity: 0.9,
  },
  phaseTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dayNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 48,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 56,
  },
  phaseSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  dayCounter: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  dayCounterText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  brandFooter: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  brandName: {
    fontSize: 14,
    letterSpacing: 2,
  },
  brandBold: {
    fontFamily: "Poppins_700Bold",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    letterSpacing: 2,
  },
  brandLight: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 2,
  },
});
