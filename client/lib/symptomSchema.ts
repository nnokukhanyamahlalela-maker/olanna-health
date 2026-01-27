export type SymptomInputType = 'toggle' | 'severity' | 'multiSelect';

export interface SymptomItem {
  id: string;
  name: string;
  icon: string;
  inputType: SymptomInputType;
  description?: string;
}

export interface SymptomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: SymptomItem[];
  isPCOS?: boolean;
  isEndometriosis?: boolean;
  isOptional?: boolean;
}

export interface SymptomLog {
  id: string;
  date: string;
  symptomId: string;
  categoryId: string;
  value: number | boolean;
  severity?: number;
  notes?: string;
  tags?: string[];
  timestamp: number;
}

export interface BodyPainPoint {
  id: string;
  date: string;
  region: string;
  painType: string;
  severity: number;
  duration?: string;
  triggers?: string[];
  notes?: string;
  timestamp: number;
}

export interface DailyCheckIn {
  date: string;
  symptoms: SymptomLog[];
  painPoints: BodyPainPoint[];
  overallMood?: number;
  overallEnergy?: number;
  notes?: string;
  completedAt: number;
}

export const SYMPTOM_TAGS = [
  'work stress',
  'heat',
  'dehydration',
  'load shedding',
  'travel',
  'poor sleep',
  'exercise',
  'alcohol',
  'caffeine',
  'medication',
  'illness',
  'emotional event',
] as const;

export const PAIN_TYPES = [
  'sharp',
  'dull',
  'cramping',
  'burning',
  'throbbing',
  'aching',
  'stabbing',
  'pressure',
] as const;

export const PAIN_DURATIONS = [
  'minutes',
  'hours',
  'all day',
  'multiple days',
] as const;

export const BODY_REGIONS = [
  { id: 'head', name: 'Head', x: 50, y: 18 },
  { id: 'neck', name: 'Neck', x: 50, y: 35 },
  { id: 'chest', name: 'Chest', x: 50, y: 50 },
  { id: 'left-breast', name: 'Left Breast', x: 36, y: 55 },
  { id: 'right-breast', name: 'Right Breast', x: 64, y: 55 },
  { id: 'upper-abdomen', name: 'Upper Abdomen', x: 50, y: 65 },
  { id: 'lower-abdomen', name: 'Lower Abdomen', x: 50, y: 78 },
  { id: 'left-ovary', name: 'Left Ovary', x: 40, y: 82 },
  { id: 'right-ovary', name: 'Right Ovary', x: 60, y: 82 },
  { id: 'pelvic', name: 'Pelvic Area', x: 50, y: 88 },
  { id: 'lower-back', name: 'Lower Back', x: 50, y: 75 },
  { id: 'upper-back', name: 'Upper Back', x: 50, y: 58 },
  { id: 'left-hip', name: 'Left Hip', x: 33, y: 92 },
  { id: 'right-hip', name: 'Right Hip', x: 67, y: 92 },
  { id: 'left-leg', name: 'Left Leg', x: 40, y: 115 },
  { id: 'right-leg', name: 'Right Leg', x: 60, y: 115 },
  { id: 'rectum', name: 'Rectal Area', x: 50, y: 94 },
] as const;

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'core-cycle',
    name: 'Core Cycle & Hormonal',
    icon: 'activity',
    color: '#FFB6C1',
    items: [
      { id: 'cramps', name: 'Cramps', icon: 'zap', inputType: 'severity' },
      { id: 'pelvic-heaviness', name: 'Pelvic Heaviness', icon: 'circle', inputType: 'severity' },
      { id: 'lower-back-pain', name: 'Lower Back Pain', icon: 'arrow-down', inputType: 'severity' },
      { id: 'upper-back-pain', name: 'Upper Back Pain', icon: 'arrow-up', inputType: 'severity' },
      { id: 'breast-tenderness', name: 'Breast Tenderness', icon: 'heart', inputType: 'severity' },
      { id: 'breast-swelling', name: 'Breast Swelling', icon: 'maximize', inputType: 'toggle' },
      { id: 'headache', name: 'Headache', icon: 'cloud', inputType: 'severity' },
      { id: 'migraine', name: 'Migraine', icon: 'cloud-lightning', inputType: 'severity' },
      { id: 'nausea', name: 'Nausea', icon: 'thermometer', inputType: 'severity' },
      { id: 'bloating', name: 'Bloating', icon: 'circle', inputType: 'severity' },
      { id: 'water-retention', name: 'Water Retention', icon: 'droplet', inputType: 'toggle' },
      { id: 'fatigue-mild', name: 'Fatigue (Mild)', icon: 'battery', inputType: 'toggle' },
      { id: 'fatigue-moderate', name: 'Fatigue (Moderate)', icon: 'battery', inputType: 'toggle' },
      { id: 'fatigue-extreme', name: 'Fatigue (Extreme)', icon: 'battery', inputType: 'toggle' },
      { id: 'dizziness', name: 'Dizziness', icon: 'loader', inputType: 'severity' },
      { id: 'appetite-increase', name: 'Increased Appetite', icon: 'plus-circle', inputType: 'toggle' },
      { id: 'appetite-decrease', name: 'Decreased Appetite', icon: 'minus-circle', inputType: 'toggle' },
    ],
  },
  {
    id: 'flow',
    name: 'Flow',
    icon: 'droplet',
    color: '#F8A5B0',
    items: [
      { id: 'spotting', name: 'Spotting', icon: 'droplet', inputType: 'toggle' },
      { id: 'flow-light', name: 'Light Flow', icon: 'droplet', inputType: 'toggle' },
      { id: 'flow-medium', name: 'Medium Flow', icon: 'droplet', inputType: 'toggle' },
      { id: 'flow-heavy', name: 'Heavy Flow', icon: 'droplet', inputType: 'toggle' },
      { id: 'clots-small', name: 'Small Clots', icon: 'circle', inputType: 'toggle' },
      { id: 'clots-large', name: 'Large Clots', icon: 'circle', inputType: 'toggle' },
      { id: 'color-bright-red', name: 'Bright Red', icon: 'circle', inputType: 'toggle' },
      { id: 'color-dark-red', name: 'Dark Red', icon: 'circle', inputType: 'toggle' },
      { id: 'color-brown', name: 'Brown', icon: 'circle', inputType: 'toggle' },
      { id: 'irregular-bleeding', name: 'Irregular Bleeding', icon: 'alert-circle', inputType: 'toggle' },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: 'heart',
    color: '#E6E6FA',
    items: [
      { id: 'calm', name: 'Calm & Grounded', icon: 'sun', inputType: 'toggle' },
      { id: 'irritable', name: 'Irritable', icon: 'zap', inputType: 'severity' },
      { id: 'anxious', name: 'Anxious', icon: 'wind', inputType: 'severity' },
      { id: 'low-mood', name: 'Low Mood / Sadness', icon: 'cloud', inputType: 'severity' },
      { id: 'emotional-sensitivity', name: 'Emotional Sensitivity', icon: 'feather', inputType: 'severity' },
      { id: 'anger', name: 'Anger / Rage', icon: 'zap', inputType: 'severity' },
      { id: 'tearful', name: 'Tearfulness', icon: 'droplet', inputType: 'toggle' },
      { id: 'emotional-numbness', name: 'Emotional Numbness', icon: 'minus', inputType: 'toggle' },
    ],
  },
  {
    id: 'cognitive',
    name: 'Cognitive',
    icon: 'cpu',
    color: '#B4D7E8',
    items: [
      { id: 'brain-fog', name: 'Brain Fog', icon: 'cloud', inputType: 'severity' },
      { id: 'mental-clarity', name: 'Mental Clarity', icon: 'sun', inputType: 'toggle' },
      { id: 'poor-concentration', name: 'Poor Concentration', icon: 'target', inputType: 'severity' },
      { id: 'racing-thoughts', name: 'Racing Thoughts', icon: 'fast-forward', inputType: 'severity' },
      { id: 'decision-fatigue', name: 'Decision Fatigue', icon: 'help-circle', inputType: 'toggle' },
      { id: 'creativity-surge', name: 'Creativity Surge', icon: 'star', inputType: 'toggle' },
      { id: 'motivation-boost', name: 'Motivation Boost', icon: 'trending-up', inputType: 'toggle' },
      { id: 'motivation-drop', name: 'Motivation Drop', icon: 'trending-down', inputType: 'toggle' },
    ],
  },
  {
    id: 'energy',
    name: 'Energy & Rhythm',
    icon: 'battery-charging',
    color: '#FFFACD',
    items: [
      { id: 'physical-energy-high', name: 'High Physical Energy', icon: 'zap', inputType: 'toggle' },
      { id: 'physical-energy-low', name: 'Low Physical Energy', icon: 'battery', inputType: 'toggle' },
      { id: 'social-energy-high', name: 'High Social Energy', icon: 'users', inputType: 'toggle' },
      { id: 'social-energy-low', name: 'Low Social Energy', icon: 'user-minus', inputType: 'toggle' },
      { id: 'need-rest', name: 'Need for Rest', icon: 'moon', inputType: 'severity' },
      { id: 'need-solitude', name: 'Need for Solitude', icon: 'user', inputType: 'toggle' },
      { id: 'desire-to-move', name: 'Desire to Move', icon: 'move', inputType: 'toggle' },
      { id: 'sleep-quality-good', name: 'Good Sleep', icon: 'moon', inputType: 'toggle' },
      { id: 'sleep-quality-poor', name: 'Poor Sleep', icon: 'cloud', inputType: 'toggle' },
      { id: 'insomnia', name: 'Insomnia', icon: 'eye', inputType: 'severity' },
      { id: 'early-waking', name: 'Early Waking', icon: 'sunrise', inputType: 'toggle' },
      { id: 'afternoon-crash', name: 'Afternoon Crash', icon: 'sunset', inputType: 'toggle' },
      { id: 'overstimulation', name: 'Overstimulation Sensitivity', icon: 'volume-2', inputType: 'severity' },
    ],
  },
  {
    id: 'sexual',
    name: 'Sexual & Reproductive',
    icon: 'heart',
    color: '#FFDAB9',
    items: [
      { id: 'libido-up', name: 'Libido Up', icon: 'trending-up', inputType: 'toggle' },
      { id: 'libido-down', name: 'Libido Down', icon: 'trending-down', inputType: 'toggle' },
      { id: 'pain-during-sex', name: 'Pain During Sex', icon: 'alert-circle', inputType: 'severity' },
      { id: 'vaginal-dryness', name: 'Vaginal Dryness', icon: 'droplet', inputType: 'toggle' },
      { id: 'sensitivity', name: 'Sensitivity/Discomfort', icon: 'alert-triangle', inputType: 'severity' },
      { id: 'desire-emotional-intimacy', name: 'Desire for Emotional Intimacy', icon: 'heart', inputType: 'toggle' },
      { id: 'desire-physical-intimacy', name: 'Desire for Physical Intimacy', icon: 'heart', inputType: 'toggle' },
    ],
  },
  {
    id: 'vaginal',
    name: 'Vaginal & Cervical',
    icon: 'shield',
    color: '#D8D8F0',
    items: [
      { id: 'cm-dry', name: 'Cervical Mucus: Dry', icon: 'minus', inputType: 'toggle' },
      { id: 'cm-sticky', name: 'Cervical Mucus: Sticky', icon: 'droplet', inputType: 'toggle' },
      { id: 'cm-creamy', name: 'Cervical Mucus: Creamy', icon: 'droplet', inputType: 'toggle' },
      { id: 'cm-eggwhite', name: 'Cervical Mucus: Egg White', icon: 'droplet', inputType: 'toggle' },
      { id: 'vaginal-itching', name: 'Itching', icon: 'alert-circle', inputType: 'severity' },
      { id: 'vaginal-burning', name: 'Burning', icon: 'zap', inputType: 'severity' },
      { id: 'unusual-discharge', name: 'Unusual Discharge', icon: 'alert-triangle', inputType: 'toggle' },
      { id: 'odor-changes', name: 'Odor Changes', icon: 'wind', inputType: 'toggle' },
    ],
  },
  {
    id: 'gut',
    name: 'Gut & Metabolic',
    icon: 'coffee',
    color: '#F5C8A0',
    items: [
      { id: 'constipation', name: 'Constipation', icon: 'minus-circle', inputType: 'severity' },
      { id: 'diarrhea', name: 'Diarrhea', icon: 'alert-circle', inputType: 'severity' },
      { id: 'ibs-symptoms', name: 'IBS-like Symptoms', icon: 'alert-triangle', inputType: 'severity' },
      { id: 'bloating-after-meals', name: 'Bloating After Meals', icon: 'circle', inputType: 'severity' },
      { id: 'sugar-cravings', name: 'Sugar Cravings', icon: 'star', inputType: 'toggle' },
      { id: 'salt-cravings', name: 'Salt Cravings', icon: 'star', inputType: 'toggle' },
      { id: 'nausea-with-food', name: 'Nausea with Food', icon: 'thermometer', inputType: 'severity' },
      { id: 'reflux', name: 'Reflux / Heartburn', icon: 'zap', inputType: 'severity' },
      { id: 'food-sensitivity', name: 'Food Sensitivity Reactions', icon: 'alert-circle', inputType: 'toggle' },
    ],
  },
  {
    id: 'skin-hair',
    name: 'Skin & Hair',
    icon: 'sun',
    color: '#F5E8A0',
    isPCOS: true,
    items: [
      { id: 'acne-jawline', name: 'Acne: Jawline', icon: 'circle', inputType: 'severity' },
      { id: 'acne-cheeks', name: 'Acne: Cheeks', icon: 'circle', inputType: 'severity' },
      { id: 'acne-back', name: 'Acne: Back', icon: 'circle', inputType: 'severity' },
      { id: 'acne-chest', name: 'Acne: Chest', icon: 'circle', inputType: 'severity' },
      { id: 'oily-skin', name: 'Oily Skin', icon: 'droplet', inputType: 'toggle' },
      { id: 'dry-skin', name: 'Dry Skin', icon: 'wind', inputType: 'toggle' },
      { id: 'hair-thinning', name: 'Hair Thinning / Shedding', icon: 'scissors', inputType: 'toggle' },
      { id: 'excess-facial-hair', name: 'Excess Facial Hair', icon: 'user', inputType: 'toggle' },
      { id: 'darkened-patches', name: 'Darkened Patches', icon: 'circle', inputType: 'toggle', description: 'Neck, underarms, or skin folds' },
      { id: 'brittle-nails', name: 'Brittle Nails', icon: 'minus', inputType: 'toggle' },
      { id: 'hives', name: 'Hives / Skin Sensitivity', icon: 'alert-circle', inputType: 'severity' },
    ],
  },
  {
    id: 'pain-mapping',
    name: 'Pain Mapping',
    icon: 'map-pin',
    color: '#FFD1DC',
    isEndometriosis: true,
    items: [
      { id: 'left-ovary-pain', name: 'Left Ovary Pain', icon: 'circle', inputType: 'severity' },
      { id: 'right-ovary-pain', name: 'Right Ovary Pain', icon: 'circle', inputType: 'severity' },
      { id: 'deep-pelvic-pain', name: 'Deep Pelvic Pain', icon: 'target', inputType: 'severity' },
      { id: 'rectal-pain', name: 'Rectal Pain', icon: 'alert-circle', inputType: 'severity' },
      { id: 'leg-radiating-pain', name: 'Pain Radiating Down Legs', icon: 'arrow-down', inputType: 'severity' },
      { id: 'hip-pain', name: 'Hip Pain', icon: 'circle', inputType: 'severity' },
      { id: 'pain-bowel-movement', name: 'Pain During Bowel Movements', icon: 'alert-triangle', inputType: 'severity' },
      { id: 'pain-before-period', name: 'Pain Before Period', icon: 'clock', inputType: 'severity' },
      { id: 'pain-after-period', name: 'Pain After Period', icon: 'clock', inputType: 'severity' },
      { id: 'pain-after-sex', name: 'Pain After Sex', icon: 'alert-circle', inputType: 'severity' },
    ],
  },
  {
    id: 'pcos',
    name: 'PCOS Indicators',
    icon: 'activity',
    color: '#B5EAD7',
    isPCOS: true,
    items: [
      { id: 'irregular-cycles', name: 'Irregular Cycles', icon: 'refresh-cw', inputType: 'toggle' },
      { id: 'missed-ovulation', name: 'Missed Ovulation', icon: 'x-circle', inputType: 'toggle' },
      { id: 'long-cycles', name: 'Long Cycles (>35 days)', icon: 'clock', inputType: 'toggle' },
      { id: 'sudden-weight-change', name: 'Sudden Weight Changes', icon: 'trending-up', inputType: 'toggle' },
      { id: 'insulin-resistance', name: 'Insulin Resistance Signs', icon: 'alert-triangle', inputType: 'toggle' },
      { id: 'reactive-hypoglycemia', name: 'Reactive Hypoglycemia', icon: 'zap', inputType: 'toggle' },
      { id: 'fatigue-after-meals', name: 'Fatigue After Meals', icon: 'battery', inputType: 'severity' },
      { id: 'blood-sugar-mood', name: 'Blood Sugar Mood Swings', icon: 'activity', inputType: 'severity' },
    ],
  },
  {
    id: 'endometriosis',
    name: 'Endometriosis Indicators',
    icon: 'shield',
    color: '#F8A5B0',
    isEndometriosis: true,
    items: [
      { id: 'chronic-pelvic-pain', name: 'Chronic Pelvic Pain', icon: 'alert-circle', inputType: 'severity' },
      { id: 'pain-outside-period', name: 'Pain Outside Menstruation', icon: 'calendar', inputType: 'severity' },
      { id: 'pain-severity-score', name: 'Pain Severity Today', icon: 'thermometer', inputType: 'severity' },
      { id: 'medication-effective', name: 'Medication Effective', icon: 'check-circle', inputType: 'toggle' },
      { id: 'medication-not-effective', name: 'Medication Not Effective', icon: 'x-circle', inputType: 'toggle' },
      { id: 'stress-triggered-pain', name: 'Stress-Triggered Pain', icon: 'zap', inputType: 'toggle' },
      { id: 'movement-triggered-pain', name: 'Movement-Triggered Pain', icon: 'move', inputType: 'toggle' },
      { id: 'flare-duration', name: 'Flare Duration (days)', icon: 'clock', inputType: 'severity' },
    ],
  },
  {
    id: 'immune-stress',
    name: 'Immune & Stress',
    icon: 'shield',
    color: '#D4F5E9',
    items: [
      { id: 'frequent-infections', name: 'Frequent Infections', icon: 'alert-circle', inputType: 'toggle' },
      { id: 'slow-recovery', name: 'Slow Recovery', icon: 'clock', inputType: 'toggle' },
      { id: 'stress-flareups', name: 'Stress Flare-ups', icon: 'zap', inputType: 'severity' },
      { id: 'inflamed-feeling', name: '"Inflamed/Heavy" Feeling', icon: 'thermometer', inputType: 'severity' },
      { id: 'heat-intolerance', name: 'Heat Intolerance', icon: 'sun', inputType: 'toggle' },
      { id: 'cold-sensitivity', name: 'Cold Sensitivity', icon: 'cloud', inputType: 'toggle' },
    ],
  },
  {
    id: 'environmental',
    name: 'Environmental',
    icon: 'globe',
    color: '#D0E8F5',
    items: [
      { id: 'weather-sensitivity', name: 'Weather Sensitivity', icon: 'cloud', inputType: 'toggle' },
      { id: 'heat-exposure', name: 'Heat Exposure', icon: 'sun', inputType: 'toggle' },
      { id: 'dehydration', name: 'Dehydration', icon: 'droplet', inputType: 'toggle' },
      { id: 'physical-labor', name: 'Physical Labor', icon: 'activity', inputType: 'toggle' },
      { id: 'commute-stress', name: 'Commute Stress', icon: 'navigation', inputType: 'severity' },
      { id: 'load-shedding', name: 'Load-Shedding Disruption', icon: 'zap-off', inputType: 'toggle' },
      { id: 'financial-stress', name: 'Financial Stress', icon: 'dollar-sign', inputType: 'severity' },
      { id: 'caregiving-burden', name: 'Caregiving Burden', icon: 'users', inputType: 'severity' },
    ],
  },
  {
    id: 'spiritual',
    name: 'Spiritual & Intuitive',
    icon: 'feather',
    color: '#F0F0FF',
    isOptional: true,
    items: [
      { id: 'feeling-intuitive', name: 'Feeling Intuitive', icon: 'eye', inputType: 'toggle' },
      { id: 'need-reflection', name: 'Need for Reflection', icon: 'moon', inputType: 'toggle' },
      { id: 'desire-grounding', name: 'Desire for Grounding/Ritual', icon: 'anchor', inputType: 'toggle' },
      { id: 'feeling-disconnected', name: 'Feeling Disconnected', icon: 'x', inputType: 'toggle' },
      { id: 'feeling-aligned', name: 'Feeling Aligned', icon: 'check', inputType: 'toggle' },
      { id: 'emotional-release', name: 'Emotional Release Days', icon: 'droplet', inputType: 'toggle' },
    ],
  },
];

export const getCategoryById = (id: string): SymptomCategory | undefined => {
  return SYMPTOM_CATEGORIES.find(cat => cat.id === id);
};

export const getSymptomById = (categoryId: string, symptomId: string): SymptomItem | undefined => {
  const category = getCategoryById(categoryId);
  return category?.items.find(item => item.id === symptomId);
};

export const getPCOSCategories = (): SymptomCategory[] => {
  return SYMPTOM_CATEGORIES.filter(cat => cat.isPCOS);
};

export const getEndometriosisCategories = (): SymptomCategory[] => {
  return SYMPTOM_CATEGORIES.filter(cat => cat.isEndometriosis);
};

export const getAllSymptomCount = (): number => {
  return SYMPTOM_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
};
