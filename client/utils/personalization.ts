import { GoalId } from "./onboardingStorage";

export type CycleModuleId =
  | "cycle_where_you_are"
  | "cycle_suggested_for_you"
  | "cycle_symptom_trends"
  | "cycle_cycle_regularity"
  | "cycle_fertility_window"
  | "cycle_education";

export type CheckInCategoryId =
  | "feelings"
  | "cravings"
  | "symptoms"
  | "cervical_mucus"
  | "gut_health"
  | "sex_and_sex_drive"
  | "flow"
  | "activities"
  | "altered_states"
  | "cycle_disruptions"
  | "birth_control"
  | "tests"
  | "medications"
  | "supplements"
  | "endometriosis"
  | "pcos"
  | "sleep"
  | "energy"
  | "stress"
  | "pain_map";

export type LearnTopicId =
  | "learn_cycle_basics"
  | "learn_pcos_basics"
  | "learn_endo_basics"
  | "learn_ovulation_fertility"
  | "learn_irregular_cycles"
  | "learn_symptom_management"
  | "learn_hormones_101"
  | "learn_lifestyle_sleep_stress"
  | "learn_tracking_habits";

const ALL_CYCLE_MODULES: CycleModuleId[] = [
  "cycle_where_you_are",
  "cycle_suggested_for_you",
  "cycle_symptom_trends",
  "cycle_cycle_regularity",
  "cycle_fertility_window",
  "cycle_education",
];

const ALL_LEARN_TOPICS: LearnTopicId[] = [
  "learn_cycle_basics",
  "learn_pcos_basics",
  "learn_endo_basics",
  "learn_ovulation_fertility",
  "learn_irregular_cycles",
  "learn_symptom_management",
  "learn_hormones_101",
  "learn_lifestyle_sleep_stress",
  "learn_tracking_habits",
];

const CYCLE_MODULE_WEIGHTS: Record<GoalId, Partial<Record<CycleModuleId, number>>> = {
  pcos: {
    cycle_cycle_regularity: 100,
    cycle_symptom_trends: 90,
    cycle_suggested_for_you: 80,
    cycle_education: 70,
    cycle_where_you_are: 60,
    cycle_fertility_window: 50,
  },
  endometriosis: {
    cycle_symptom_trends: 100,
    cycle_suggested_for_you: 90,
    cycle_education: 80,
    cycle_where_you_are: 70,
    cycle_cycle_regularity: 60,
    cycle_fertility_window: 50,
  },
  ttc: {
    cycle_fertility_window: 100,
    cycle_suggested_for_you: 90,
    cycle_where_you_are: 80,
    cycle_education: 70,
    cycle_symptom_trends: 60,
    cycle_cycle_regularity: 50,
  },
  period_tracking: {
    cycle_where_you_are: 100,
    cycle_suggested_for_you: 90,
    cycle_symptom_trends: 80,
    cycle_education: 70,
    cycle_cycle_regularity: 60,
    cycle_fertility_window: 50,
  },
  symptoms: {
    cycle_symptom_trends: 100,
    cycle_suggested_for_you: 85,
    cycle_where_you_are: 75,
    cycle_education: 65,
    cycle_cycle_regularity: 55,
    cycle_fertility_window: 45,
  },
  regularity: {
    cycle_cycle_regularity: 100,
    cycle_where_you_are: 85,
    cycle_symptom_trends: 75,
    cycle_suggested_for_you: 70,
    cycle_education: 60,
    cycle_fertility_window: 50,
  },
  learn_hormones: {
    cycle_education: 100,
    cycle_where_you_are: 85,
    cycle_suggested_for_you: 80,
    cycle_symptom_trends: 70,
    cycle_cycle_regularity: 60,
    cycle_fertility_window: 50,
  },
};

const CHECK_IN_CATEGORIES_BY_GOAL: Record<GoalId, CheckInCategoryId[]> = {
  pcos: ["pcos", "cravings", "feelings", "energy", "sleep", "cycle_disruptions"],
  endometriosis: ["endometriosis", "symptoms", "pain_map", "gut_health", "sleep", "energy"],
  ttc: ["cervical_mucus", "sex_and_sex_drive", "tests", "feelings", "activities"],
  period_tracking: ["flow", "symptoms", "feelings", "energy"],
  symptoms: ["symptoms", "feelings", "energy", "pain_map", "sleep"],
  regularity: ["cycle_disruptions", "sleep", "stress", "activities", "flow"],
  learn_hormones: ["feelings", "symptoms", "cycle_disruptions", "sleep"],
};

const LEARN_TOPIC_WEIGHTS: Record<GoalId, Partial<Record<LearnTopicId, number>>> = {
  pcos: {
    learn_pcos_basics: 100,
    learn_irregular_cycles: 90,
    learn_symptom_management: 85,
    learn_lifestyle_sleep_stress: 80,
    learn_tracking_habits: 75,
    learn_hormones_101: 70,
    learn_cycle_basics: 65,
    learn_ovulation_fertility: 60,
    learn_endo_basics: 55,
  },
  endometriosis: {
    learn_endo_basics: 100,
    learn_symptom_management: 95,
    learn_lifestyle_sleep_stress: 90,
    learn_cycle_basics: 85,
    learn_tracking_habits: 80,
    learn_hormones_101: 75,
    learn_pcos_basics: 70,
    learn_irregular_cycles: 65,
    learn_ovulation_fertility: 60,
  },
  ttc: {
    learn_ovulation_fertility: 100,
    learn_tracking_habits: 95,
    learn_hormones_101: 90,
    learn_cycle_basics: 85,
    learn_lifestyle_sleep_stress: 80,
    learn_symptom_management: 75,
    learn_irregular_cycles: 70,
    learn_pcos_basics: 65,
    learn_endo_basics: 60,
  },
  period_tracking: {
    learn_cycle_basics: 100,
    learn_tracking_habits: 95,
    learn_symptom_management: 90,
    learn_hormones_101: 85,
    learn_lifestyle_sleep_stress: 80,
    learn_ovulation_fertility: 75,
    learn_irregular_cycles: 70,
    learn_pcos_basics: 65,
    learn_endo_basics: 60,
  },
  symptoms: {
    learn_symptom_management: 100,
    learn_cycle_basics: 90,
    learn_tracking_habits: 85,
    learn_lifestyle_sleep_stress: 80,
    learn_hormones_101: 75,
    learn_irregular_cycles: 70,
    learn_ovulation_fertility: 65,
    learn_pcos_basics: 60,
    learn_endo_basics: 55,
  },
  regularity: {
    learn_irregular_cycles: 100,
    learn_cycle_basics: 95,
    learn_tracking_habits: 90,
    learn_lifestyle_sleep_stress: 85,
    learn_hormones_101: 80,
    learn_symptom_management: 75,
    learn_ovulation_fertility: 70,
    learn_pcos_basics: 65,
    learn_endo_basics: 60,
  },
  learn_hormones: {
    learn_hormones_101: 100,
    learn_cycle_basics: 95,
    learn_lifestyle_sleep_stress: 90,
    learn_symptom_management: 85,
    learn_tracking_habits: 80,
    learn_ovulation_fertility: 75,
    learn_irregular_cycles: 70,
    learn_pcos_basics: 65,
    learn_endo_basics: 60,
  },
};

function scoreAndSort<T extends string>(
  items: T[],
  weights: Record<GoalId, Partial<Record<T, number>>>,
  goals: GoalId[]
): T[] {
  const scores: Record<string, number> = {};

  for (const item of items) {
    scores[item] = 0;
    for (const goal of goals) {
      const goalWeights = weights[goal];
      if (goalWeights && goalWeights[item] !== undefined) {
        scores[item] += goalWeights[item]!;
      }
    }
  }

  return [...items].sort((a, b) => scores[b] - scores[a]);
}

export function getModuleOrder(goals: GoalId[]): CycleModuleId[] {
  if (goals.length === 0) {
    return ALL_CYCLE_MODULES;
  }
  return scoreAndSort(ALL_CYCLE_MODULES, CYCLE_MODULE_WEIGHTS, goals);
}

export function getDefaultCheckInCategories(goals: GoalId[]): CheckInCategoryId[] {
  if (goals.length === 0) {
    return ["flow", "symptoms", "feelings", "energy"];
  }

  const categorySet = new Set<CheckInCategoryId>();

  for (const goal of goals) {
    const categories = CHECK_IN_CATEGORIES_BY_GOAL[goal] || [];
    for (const cat of categories) {
      categorySet.add(cat);
    }
  }

  const result = Array.from(categorySet);
  return result.slice(0, 5);
}

export function getLearnTopicOrder(goals: GoalId[]): LearnTopicId[] {
  if (goals.length === 0) {
    return ALL_LEARN_TOPICS;
  }
  return scoreAndSort(ALL_LEARN_TOPICS, LEARN_TOPIC_WEIGHTS, goals);
}

export const MODULE_INFO: Record<CycleModuleId, { title: string; description: string; icon: string }> = {
  cycle_where_you_are: {
    title: "Where You Are",
    description: "Your current cycle day and phase",
    icon: "compass",
  },
  cycle_suggested_for_you: {
    title: "Suggested For You",
    description: "Personalized recommendations",
    icon: "star",
  },
  cycle_symptom_trends: {
    title: "Symptom Trends",
    description: "Patterns in your tracked symptoms",
    icon: "trending-up",
  },
  cycle_cycle_regularity: {
    title: "Cycle Regularity",
    description: "Your cycle length patterns",
    icon: "repeat",
  },
  cycle_fertility_window: {
    title: "Fertility Window",
    description: "Ovulation prediction and tracking",
    icon: "heart",
  },
  cycle_education: {
    title: "Learn",
    description: "Understanding your cycle",
    icon: "book-open",
  },
};

export const LEARN_TOPIC_INFO: Record<LearnTopicId, { title: string; category: string }> = {
  learn_cycle_basics: { title: "Cycle Basics", category: "Periods" },
  learn_pcos_basics: { title: "PCOS Basics", category: "PCOS" },
  learn_endo_basics: { title: "Endometriosis Basics", category: "Endometriosis" },
  learn_ovulation_fertility: { title: "Ovulation & Fertility", category: "Fertility" },
  learn_irregular_cycles: { title: "Irregular Cycles", category: "Periods" },
  learn_symptom_management: { title: "Symptom Management", category: "Wellness" },
  learn_hormones_101: { title: "Hormones 101", category: "Wellness" },
  learn_lifestyle_sleep_stress: { title: "Lifestyle, Sleep & Stress", category: "Wellness" },
  learn_tracking_habits: { title: "Tracking Habits", category: "Wellness" },
};

export const CHECK_IN_CATEGORY_INFO: Record<CheckInCategoryId, { title: string; icon: string }> = {
  feelings: { title: "Feelings", icon: "smile" },
  cravings: { title: "Cravings", icon: "coffee" },
  symptoms: { title: "Symptoms", icon: "activity" },
  cervical_mucus: { title: "Cervical Mucus", icon: "droplet" },
  gut_health: { title: "Gut Health", icon: "circle" },
  sex_and_sex_drive: { title: "Sex & Libido", icon: "heart" },
  flow: { title: "Flow", icon: "droplet" },
  activities: { title: "Activities", icon: "zap" },
  altered_states: { title: "Altered States", icon: "moon" },
  cycle_disruptions: { title: "Cycle Disruptions", icon: "alert-circle" },
  birth_control: { title: "Birth Control", icon: "shield" },
  tests: { title: "Tests", icon: "clipboard" },
  medications: { title: "Medications", icon: "package" },
  supplements: { title: "Supplements", icon: "plus-circle" },
  endometriosis: { title: "Endometriosis", icon: "target" },
  pcos: { title: "PCOS", icon: "circle" },
  sleep: { title: "Sleep", icon: "moon" },
  energy: { title: "Energy", icon: "battery-charging" },
  stress: { title: "Stress", icon: "wind" },
  pain_map: { title: "Pain Map", icon: "map-pin" },
};
