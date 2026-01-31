import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_NAME: "userName",
  USER_GOALS: "userGoals",
  HAS_SEEN_INTRO: "hasSeenIntro",
} as const;

export type GoalId =
  | "period_tracking"
  | "ttc"
  | "symptoms"
  | "pcos"
  | "endometriosis"
  | "regularity"
  | "learn_hormones";

export const GOAL_IDS: GoalId[] = [
  "period_tracking",
  "ttc",
  "symptoms",
  "pcos",
  "endometriosis",
  "regularity",
  "learn_hormones",
];

export async function getUserName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
  } catch {
    return null;
  }
}

export async function setUserName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  } catch (error) {
    console.error("Failed to save user name:", error);
  }
}

export async function getUserGoals(): Promise<GoalId[]> {
  try {
    const goalsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_GOALS);
    if (goalsJson) {
      const parsed = JSON.parse(goalsJson);
      if (Array.isArray(parsed)) {
        return parsed.filter((g): g is GoalId => GOAL_IDS.includes(g as GoalId));
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function setUserGoals(goals: GoalId[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save user goals:", error);
  }
}

export async function getHasSeenIntro(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setHasSeenIntro(seen: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, seen ? "true" : "false");
  } catch (error) {
    console.error("Failed to save intro flag:", error);
  }
}

export async function clearOnboardingData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_NAME,
      STORAGE_KEYS.USER_GOALS,
      STORAGE_KEYS.HAS_SEEN_INTRO,
    ]);
  } catch (error) {
    console.error("Failed to clear onboarding data:", error);
  }
}

export interface OnboardingData {
  userName: string | null;
  userGoals: GoalId[];
  hasSeenIntro: boolean;
}

export async function getOnboardingData(): Promise<OnboardingData> {
  const [userName, userGoals, hasSeenIntro] = await Promise.all([
    getUserName(),
    getUserGoals(),
    getHasSeenIntro(),
  ]);
  return { userName, userGoals, hasSeenIntro };
}
