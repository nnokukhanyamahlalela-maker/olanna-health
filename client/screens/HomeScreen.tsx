import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { PHASE_INFO, CyclePhase } from "@/components/Lotus";
import { LotusCycleWheel } from "@/components/LotusCycleWheel";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, CycleData, UserProfile, calculateCycleData } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// DESIGN TOKENS - Exact brand colors from spec
// ============================================================================
const COLORS = {
  // Gradient colors (exact spec)
  hotPink: "#FF4FB8",
  sunsetOrange: "#F7A37A",
  softLavender: "#C9B8E8",
  lightBlush: "#FDF1F6",
  
  // Phase colors
  period: "#FF4FB8",           // Hot pink for period
  fertile: "#F7A37A",          // Sunset orange for fertile
  pms: "#C9B8E8",              // Soft lavender for PMS
  
  // UI colors
  background: "#FDF1F6",       // Light blush background
  cardBg: "#FFFFFF",
  text: "#2D2A32",             // Near-black
  textSecondary: "#7A7580",    // Muted gray
  textLight: "#FFFFFF",
  accent: "#FF4FB8",
  border: "#F0EBE8",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const getWeekDays = (currentDate: Date = new Date()) => {
  const days = [];
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
      date,
    });
  }
  return days;
};

const getMonthName = () => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const getPhaseName = (phase: CyclePhase): string => {
  const names = {
    menstrual: "Period",
    follicular: "Follicular",
    ovulation: "Ovulation",
    luteal: "Luteal",
  };
  return names[phase];
};

const getDaysUntilOvulation = (currentDay: number, ovulationDay: number, cycleLength: number): number => {
  if (currentDay < ovulationDay) {
    return ovulationDay - currentDay;
  }
  return cycleLength - currentDay + ovulationDay;
};

// ============================================================================
// WEEK STRIP COMPONENT
// ============================================================================
const WeekStrip = ({ 
  onDaySelect, 
  selectedDate,
  cycleData,
}: { 
  onDaySelect?: (date: Date) => void;
  selectedDate?: Date;
  cycleData: CycleData | null;
}) => {
  const weekDays = getWeekDays();
  
  return (
    <View style={styles.weekStrip}>
      {weekDays.map((day, index) => (
        <Pressable
          key={index}
          style={styles.dayColumn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDaySelect?.(day.date);
          }}
        >
          <ThemedText style={[
            styles.dayName,
            day.isToday && styles.dayNameActive
          ]}>
            {day.dayName}
          </ThemedText>
          <View style={[
            styles.dayCircle,
            day.isToday && styles.dayCircleActive,
          ]}>
            {day.isToday ? (
              <LinearGradient
                colors={[COLORS.hotPink, COLORS.sunsetOrange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dayCircleGradient}
              >
                <ThemedText style={styles.dayNumberActive}>
                  {day.dayNumber}
                </ThemedText>
              </LinearGradient>
            ) : (
              <ThemedText style={styles.dayNumber}>
                {day.dayNumber}
              </ThemedText>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
};

// ============================================================================
// HERO CARD COMPONENT - Main cycle status display
// ============================================================================
const HeroCard = ({ 
  cycleData, 
  onCheckIn 
}: { 
  cycleData: CycleData; 
  onCheckIn: () => void;
}) => {
  const phaseName = getPhaseName(cycleData.phase);
  const daysUntilOvulation = getDaysUntilOvulation(cycleData.currentDay, 14, cycleData.cycleLength);
  const phaseInfo = PHASE_INFO[cycleData.phase];
  
  return (
    <LinearGradient
      colors={[COLORS.hotPink, COLORS.sunsetOrange, COLORS.softLavender]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      {/* Top section with phase indicator */}
      <View style={styles.heroTop}>
        <View style={styles.phaseIndicator}>
          <View style={styles.phaseDot} />
          <ThemedText style={styles.phaseLabel}>{phaseName}</ThemedText>
        </View>
        
        <Pressable style={styles.settingsButton} onPress={onCheckIn}>
          <Feather name="edit-2" size={18} color={COLORS.textLight} />
        </Pressable>
      </View>
      
      {/* Main day display */}
      <View style={styles.heroCenter}>
        <ThemedText style={styles.heroDayLabel}>day</ThemedText>
        <ThemedText style={styles.heroDayNumber}>{cycleData.currentDay}</ThemedText>
      </View>
      
      {/* Bottom info */}
      <View style={styles.heroBottom}>
        <ThemedText style={styles.heroSubtext}>
          Next ovulation in {daysUntilOvulation} days
        </ThemedText>
      </View>
      
      {/* Decorative circle */}
      <View style={styles.decorativeCircle} />
    </LinearGradient>
  );
};

// ============================================================================
// TIMELINE EVENT COMPONENT
// ============================================================================
const TimelineEvent = ({ 
  date, 
  title, 
  subtitle, 
  color 
}: { 
  date: string; 
  title: string; 
  subtitle: string; 
  color: string;
}) => (
  <View style={styles.timelineEvent}>
    <View style={styles.timelineDateColumn}>
      <ThemedText style={styles.timelineDate}>{date}</ThemedText>
    </View>
    <View style={styles.timelineLine}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.timelineConnector} />
    </View>
    <View style={styles.timelineContent}>
      <ThemedText style={[styles.timelineTitle, { color }]}>{title}</ThemedText>
      <ThemedText style={styles.timelineSubtitle}>{subtitle}</ThemedText>
    </View>
  </View>
);

// ============================================================================
// MOOD CHECK-IN CARD
// ============================================================================
const MoodCard = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <LinearGradient
      colors={['#F0D5E8', '#E8D5F0', '#E5D8C8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.moodCard}
    >
      <View style={styles.moodCardHeader}>
        <ThemedText style={styles.moodCardTitle}>State of Mind</ThemedText>
        <View style={styles.moodIcon}>
          <Feather name="smile" size={20} color={COLORS.textSecondary} />
        </View>
      </View>
      <ThemedText style={styles.moodCardQuestion}>How you feel{'\n'}right now?</ThemedText>
      <View style={styles.moodButton}>
        <ThemedText style={styles.moodButtonText}>Log a Mood</ThemedText>
      </View>
    </LinearGradient>
  </Pressable>
);

// ============================================================================
// MAIN HOME SCREEN
// ============================================================================
export default function HomeScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCheckIn = () => {
    navigation.navigate("Main", { screen: "Check-in" } as any);
  };

  // Generate timeline events based on cycle data
  const generateTimelineEvents = () => {
    if (!cycleData) return [];
    
    const today = new Date();
    const events = [];
    
    // Period event
    const periodDate = new Date(today);
    periodDate.setDate(today.getDate() + (cycleData.cycleLength - cycleData.currentDay));
    events.push({
      date: periodDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase(),
      title: "Period",
      subtitle: `${profile?.periodLength || 5}-7 days`,
      color: COLORS.period,
    });
    
    // Fertile window
    const fertileDate = new Date(today);
    const daysToFertile = getDaysUntilOvulation(cycleData.currentDay, 14, cycleData.cycleLength) - 3;
    fertileDate.setDate(today.getDate() + Math.max(0, daysToFertile));
    events.push({
      date: fertileDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase(),
      title: "Fertility window",
      subtitle: `Ovulation around ${new Date(fertileDate.getTime() + 3*24*60*60*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      color: COLORS.fertile,
    });
    
    // PMS
    const pmsDate = new Date(periodDate);
    pmsDate.setDate(periodDate.getDate() - 5);
    events.push({
      date: pmsDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase(),
      title: "PMS",
      subtitle: pmsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      color: COLORS.pms,
    });
    
    return events.slice(0, 3);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading...</ThemedText>
        </View>
      </View>
    );
  }

  if (!profile || !cycleData) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <EmptyState
            image={require("../../assets/images/empty-cycle.png")}
            title="Begin Your Wellness Journey"
            description="Set up your profile to track your cycle and receive personalized insights."
            actionLabel="Get Started"
            onAction={() => navigation.navigate("Onboarding")}
          />
        </View>
      </View>
    );
  }

  const timelineEvents = generateTimelineEvents();

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.xl,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with month and profile */}
        <View style={styles.header}>
          <ThemedText style={styles.monthTitle}>{getMonthName()}</ThemedText>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileButton}
            testID="profile-button"
          >
            <Feather name="user" size={20} color={COLORS.text} />
          </Pressable>
        </View>
        
        {/* Week Strip */}
        <WeekStrip cycleData={cycleData} />
        
        {/* Lotus Cycle Wheel */}
        <View style={styles.lotusWheelContainer}>
          <LotusCycleWheel
            currentDay={cycleData.currentDay}
            cycleLength={cycleData.cycleLength}
            phase={cycleData.phase}
            periodLength={profile?.periodLength || 5}
            size={280}
            showInfo={true}
          />
        </View>
        
        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <ThemedText style={styles.sectionTitle}>Timelines</ThemedText>
          {timelineEvents.map((event, index) => (
            <TimelineEvent
              key={index}
              date={event.date}
              title={event.title}
              subtitle={event.subtitle}
              color={event.color}
            />
          ))}
        </View>
        
        {/* Mood Card */}
        <MoodCard onPress={handleCheckIn} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
  },
  
  // Lotus Wheel
  lotusWheelContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  monthTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    color: COLORS.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Week Strip
  weekStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  dayColumn: {
    alignItems: "center",
    gap: 6,
  },
  dayName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  dayNameActive: {
    color: COLORS.accent,
    fontFamily: "DMSans_500Medium",
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    overflow: "hidden",
  },
  dayCircleGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: COLORS.text,
  },
  dayNumberActive: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: COLORS.textLight,
  },
  
  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    minHeight: 180,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phaseIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    opacity: 0.8,
  },
  phaseLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: COLORS.textLight,
    opacity: 0.9,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCenter: {
    marginTop: Spacing.lg,
  },
  heroDayLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: COLORS.textLight,
    opacity: 0.8,
    textTransform: "lowercase",
  },
  heroDayNumber: {
    fontFamily: "DMSans_700Bold",
    fontSize: 64,
    color: COLORS.textLight,
    lineHeight: 72,
    marginTop: -8,
  },
  heroBottom: {
    marginTop: Spacing.md,
  },
  heroSubtext: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: COLORS.textLight,
    opacity: 0.85,
  },
  decorativeCircle: {
    position: "absolute",
    right: -30,
    top: "30%",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  
  // Timeline
  timelineSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: Spacing.md,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  timelineDateColumn: {
    width: 50,
  },
  timelineDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timelineLine: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineConnector: {
    flex: 1,
    width: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  timelineTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
  },
  timelineSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Mood Card
  moodCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  moodCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  moodCardTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  moodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  moodCardQuestion: {
    fontFamily: "DMSans_700Bold",
    fontSize: 26,
    color: COLORS.textLight,
    lineHeight: 34,
    marginBottom: Spacing.lg,
  },
  moodButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  moodButtonText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: COLORS.text,
  },
});
