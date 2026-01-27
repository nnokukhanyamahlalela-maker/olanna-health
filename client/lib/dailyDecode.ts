import { SymptomLog } from './symptomSchema';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface DailyDecodeInput {
  symptoms: SymptomLog[];
  phase: CyclePhase;
  hasPCOS: boolean;
  hasEndometriosis?: boolean;
}

export interface DailyDecodeOutput {
  vibeText: string;
  movementTitle: string;
  movementBody: string;
  foodsTitle: string;
  foodsList: string[];
  foodsBody: string;
  tinyReset: string;
  closingLine: string;
}

const PHASE_FOODS: Record<CyclePhase, string[]> = {
  follicular: ['eggs', 'spinach', 'oats', 'apples', 'yogurt'],
  ovulation: ['leafy greens', 'berries', 'fish or tofu', 'quinoa', 'lemon water'],
  luteal: ['sweet potatoes', 'brown rice', 'chicken', 'bananas', 'dark chocolate'],
  menstrual: ['soups', 'lentils', 'red meat or beans', 'toast', 'herbal tea'],
};

const PHASE_VIBES: Record<CyclePhase, string> = {
  follicular: "Your energy is building today, and I can feel it. This is your time to lean into new ideas and fresh starts.",
  ovulation: "You're in your radiant phase right now. Your body is feeling strong and social energy is high.",
  luteal: "Things might feel a bit slower today, and that's totally okay. Your body is asking for a little more gentleness.",
  menstrual: "Rest mode is activated, and I'm here for it. Your body is doing important work right now.",
};

const CLOSING_LINES = [
  "You're not behind. I promise.",
  "One small thing today is enough.",
  "You're doing better than you think.",
  "I'm proud of you for checking in.",
  "Tomorrow is a fresh start, always.",
];

function hasSymptom(symptoms: SymptomLog[], ...ids: string[]): boolean {
  return symptoms.some(s => ids.includes(s.symptomId));
}

function getRandomClosing(): string {
  return CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)];
}

export function generateDailyDecode(input: DailyDecodeInput): DailyDecodeOutput {
  const { symptoms, phase, hasPCOS } = input;

  const hasAcne = hasSymptom(symptoms, 'acne', 'acne-jawline', 'acne-cheeks', 'acne-back', 'acne-chest');
  const hasOilySkin = hasSymptom(symptoms, 'oily-skin', 'oily_skin');
  const hasDrySkin = hasSymptom(symptoms, 'dry-skin', 'dry_skin');
  const hasHairThinning = hasSymptom(symptoms, 'hair-thinning', 'hair-shedding', 'hair_thinning', 'hair_shedding');
  const hasExcessHair = hasSymptom(symptoms, 'excess-facial-hair', 'excess_facial_hair', 'hirsutism');
  const hasFatigue = hasSymptom(symptoms, 'fatigue', 'low-energy', 'exhaustion');
  const hasCramps = hasSymptom(symptoms, 'cramps', 'cramping', 'period-cramps');
  const hasBloating = hasSymptom(symptoms, 'bloating', 'bloated');
  const hasHeadache = hasSymptom(symptoms, 'headache', 'migraine');
  const hasAnxiety = hasSymptom(symptoms, 'anxiety', 'anxious', 'nervous');

  let vibeText = PHASE_VIBES[phase];
  let movementTitle = "Move gently";
  let movementBody = "A 15-minute walk or some light stretching would be perfect for today.";
  let foodsList = [...PHASE_FOODS[phase]];
  let foodsBody = "These foods work beautifully with where you are in your cycle.";
  let tinyReset = "Step outside for 5 minutes. Fresh air does wonders.";

  if (hasPCOS && (hasAcne || hasOilySkin || hasHairThinning || hasExcessHair)) {
    movementTitle = "Keep it low-key today";
    movementBody = "I'd suggest a hot girl walk or some gentle yoga. No need to push hard right now — your hormones will thank you.";
    foodsBody = "These foods help keep your blood sugar steady, which is exactly what your body needs.";
    foodsList = ['eggs', 'leafy greens', 'nuts', 'avocado', ...PHASE_FOODS[phase].slice(0, 2)].slice(0, 5);
  }

  if (hasDrySkin) {
    vibeText = "Your skin is telling me it needs some extra love today. Hydration is your friend right now.";
    foodsList = ['water (lots!)', 'olive oil', 'avocado', 'salmon', 'nuts'];
    foodsBody = "These are packed with healthy fats and hydration to help your skin glow from the inside out.";
    tinyReset = "Drink a big glass of water right now. Your skin will notice.";
  }

  if (hasHairThinning) {
    foodsList = ['eggs', 'chicken', 'lentils', 'spinach', 'beans'];
    foodsBody = "Protein and iron are your hair's best friends right now. These foods have you covered.";
  }

  if (hasFatigue) {
    vibeText = "I hear you — energy is low today. That's your body asking for rest, not a reason to push harder.";
    movementTitle = "Gentle stretches only";
    movementBody = "5-10 minutes of stretching is plenty. Your body needs recovery, not a workout.";
    tinyReset = "Lie down for 5 minutes with your eyes closed. No phone. Just breathe.";
  }

  if (hasCramps || hasBloating) {
    tinyReset = "Try a warm compress on your lower belly. It's simple but so soothing.";
    if (hasCramps) {
      movementBody = "Gentle movement can actually help with cramps. A slow walk or child's pose in yoga.";
    }
  }

  if (hasHeadache) {
    vibeText = "That headache is telling you something. Let's take it easy and give your body what it needs.";
    tinyReset = "Dim the lights, close your eyes, and take 10 slow breaths. I'll wait.";
  }

  if (hasAnxiety) {
    vibeText = "Your mind might feel a bit busy today. That's okay — let's focus on grounding you.";
    tinyReset = "Put your feet flat on the floor and take 5 deep breaths. You're safe.";
    movementBody = "Movement helps anxiety so much. Even a 10-minute walk can shift your energy.";
  }

  return {
    vibeText,
    movementTitle,
    movementBody,
    foodsTitle: "Foods that'll love you back today",
    foodsList: foodsList.slice(0, 5),
    foodsBody,
    tinyReset,
    closingLine: getRandomClosing(),
  };
}
