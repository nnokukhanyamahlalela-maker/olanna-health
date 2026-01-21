import { SymptomLog, BodyPainPoint, getCategoryById, getSymptomById } from './symptomSchema';

export interface HealthInsight {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'alert' | 'tip';
  title: string;
  description: string;
  icon: string;
  color: string;
  severity: 'info' | 'warning' | 'important';
  actionable?: string;
  learnMoreTopic?: string;
}

export interface SymptomTrend {
  symptomId: string;
  symptomName: string;
  categoryId: string;
  frequency: number;
  averageSeverity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  peakDayOfCycle?: number;
}

export function analyzeSymptomPatterns(
  logs: SymptomLog[],
  cycleDay?: number,
  cycleLength: number = 28
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  const symptomFrequency = new Map<string, SymptomLog[]>();
  logs.forEach(log => {
    const existing = symptomFrequency.get(log.symptomId) || [];
    symptomFrequency.set(log.symptomId, [...existing, log]);
  });

  const severePainLogs = logs.filter(l =>
    (l.severity || 0) >= 4 &&
    ['cramps', 'deep-pelvic-pain', 'left-ovary-pain', 'right-ovary-pain'].includes(l.symptomId)
  );

  if (severePainLogs.length >= 3) {
    insights.push({
      id: 'severe-pain-pattern',
      type: 'alert',
      title: 'Recurring Severe Pain',
      description: 'You\'ve logged significant pain multiple times. This may warrant a conversation with a healthcare provider.',
      icon: 'alert-circle',
      color: '#C4574A',
      severity: 'important',
      actionable: 'Consider booking an appointment with your doctor to discuss your pain patterns.',
      learnMoreTopic: 'when-to-see-doctor',
    });
  }

  const heavyFlowLogs = logs.filter(l => l.symptomId === 'flow-heavy');
  if (heavyFlowLogs.length >= 3) {
    insights.push({
      id: 'heavy-flow-pattern',
      type: 'pattern',
      title: 'Consistent Heavy Flow',
      description: 'Heavy bleeding for 3+ days may affect iron levels. Stay hydrated and consider iron-rich foods.',
      icon: 'droplet',
      color: '#C4574A',
      severity: 'warning',
      actionable: 'Include iron-rich foods like leafy greens, beans, and fortified cereals in your diet.',
      learnMoreTopic: 'heavy-periods',
    });
  }

  const irregularLogs = logs.filter(l => l.symptomId === 'irregular-bleeding');
  if (irregularLogs.length >= 2) {
    insights.push({
      id: 'irregular-bleeding',
      type: 'alert',
      title: 'Irregular Bleeding Noted',
      description: 'Spotting or bleeding outside your period can have various causes. Track when it occurs.',
      icon: 'alert-triangle',
      color: '#D4A84B',
      severity: 'warning',
      learnMoreTopic: 'irregular-bleeding',
    });
  }

  const crampsLogs = symptomFrequency.get('cramps') || [];
  const bloatingLogs = symptomFrequency.get('bloating') || [];

  if (crampsLogs.length >= 3 && bloatingLogs.length >= 2) {
    const overlappingDays = crampsLogs.filter(c =>
      bloatingLogs.some(b => b.date === c.date)
    );
    if (overlappingDays.length >= 2) {
      insights.push({
        id: 'cramps-bloating-correlation',
        type: 'correlation',
        title: 'Cramps & Bloating Often Together',
        description: 'These symptoms frequently occur together for you. This is common before and during menstruation.',
        icon: 'link',
        color: '#7BA387',
        severity: 'info',
        actionable: 'Gentle movement and heat therapy may help relieve both symptoms.',
      });
    }
  }

  const moodSymptoms = ['low-mood', 'anxious', 'irritable', 'tearful'];
  const moodLogs = logs.filter(l => moodSymptoms.includes(l.symptomId));

  if (moodLogs.length >= 3) {
    insights.push({
      id: 'mood-changes-pattern',
      type: 'pattern',
      title: 'Mood Fluctuations Detected',
      description: 'Hormonal changes throughout your cycle can affect mood. This is completely normal.',
      icon: 'heart',
      color: '#D4A5A5',
      severity: 'info',
      actionable: 'Prioritize rest and self-care during these times. Journaling may also help.',
      learnMoreTopic: 'cycle-mood',
    });
  }

  const fatigueSymptoms = ['fatigue-mild', 'fatigue-moderate', 'fatigue-extreme', 'afternoon-crash'];
  const fatigueLogs = logs.filter(l => fatigueSymptoms.includes(l.symptomId));

  if (fatigueLogs.length >= 5) {
    insights.push({
      id: 'fatigue-pattern',
      type: 'trend',
      title: 'Energy Patterns Emerging',
      description: 'Fatigue is a common cycle symptom. Your energy naturally fluctuates throughout your cycle.',
      icon: 'battery',
      color: '#D4A84B',
      severity: 'info',
      actionable: 'Plan demanding tasks for when you feel most energetic.',
    });
  }

  const pcosIndicators = [
    'irregular-cycles', 'long-cycles', 'acne-jawline',
    'excess-facial-hair', 'hair-thinning', 'fatigue-after-meals',
  ];
  const pcosLogs = logs.filter(l => pcosIndicators.includes(l.symptomId));

  if (pcosLogs.length >= 3) {
    const uniqueSymptoms = new Set(pcosLogs.map(l => l.symptomId));
    if (uniqueSymptoms.size >= 2) {
      insights.push({
        id: 'pcos-indicators',
        type: 'pattern',
        title: 'PCOS-Related Symptoms',
        description: 'Some of your symptoms may be associated with PCOS. Continue tracking for clearer patterns.',
        icon: 'activity',
        color: '#7BA387',
        severity: 'info',
        learnMoreTopic: 'pcos-overview',
      });
    }
  }

  const endoIndicators = [
    'deep-pelvic-pain', 'pain-during-sex', 'pain-after-sex',
    'pain-bowel-movement', 'chronic-pelvic-pain', 'pain-outside-period',
  ];
  const endoLogs = logs.filter(l => endoIndicators.includes(l.symptomId));

  if (endoLogs.length >= 2) {
    insights.push({
      id: 'endo-indicators',
      type: 'pattern',
      title: 'Endometriosis-Related Symptoms',
      description: 'Pain patterns you\'ve logged are sometimes associated with endometriosis. A healthcare provider can help evaluate.',
      icon: 'shield',
      color: '#8B3A4C',
      severity: 'warning',
      actionable: 'Consider discussing these symptoms with a gynecologist.',
      learnMoreTopic: 'endometriosis-overview',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'keep-logging',
      type: 'tip',
      title: 'Building Your Health Picture',
      description: 'Continue logging daily to discover your unique patterns and receive personalized insights.',
      icon: 'trending-up',
      color: '#7BA387',
      severity: 'info',
    });
  }

  return insights;
}

export function getPhaseInsights(cycleDay: number, cycleLength: number = 28): HealthInsight[] {
  const insights: HealthInsight[] = [];

  const menstrualEnd = 5;
  const follicularEnd = cycleLength * 0.35;
  const ovulationEnd = cycleLength * 0.55;

  if (cycleDay <= menstrualEnd) {
    insights.push({
      id: 'menstrual-phase-tip',
      type: 'tip',
      title: 'Menstrual Phase',
      description: 'Your body is renewing. Rest is productive. Iron-rich foods support blood loss recovery.',
      icon: 'moon',
      color: '#8B3A4C',
      severity: 'info',
    });
  } else if (cycleDay <= follicularEnd) {
    insights.push({
      id: 'follicular-phase-tip',
      type: 'tip',
      title: 'Follicular Phase',
      description: 'Rising estrogen brings increased energy. Great time for new projects and social activities.',
      icon: 'sunrise',
      color: '#7BA387',
      severity: 'info',
    });
  } else if (cycleDay <= ovulationEnd) {
    insights.push({
      id: 'ovulation-phase-tip',
      type: 'tip',
      title: 'Ovulation Window',
      description: 'Peak energy and communication. This is when fertility is highest if tracking for conception.',
      icon: 'sun',
      color: '#D4A84B',
      severity: 'info',
    });
  } else {
    insights.push({
      id: 'luteal-phase-tip',
      type: 'tip',
      title: 'Luteal Phase',
      description: 'Progesterone rises. Honor any need to slow down. PMS symptoms may appear in the second half.',
      icon: 'sunset',
      color: '#C4826B',
      severity: 'info',
    });
  }

  return insights;
}

export function calculateSymptomTrends(
  logs: SymptomLog[],
  days: number = 30
): SymptomTrend[] {
  const trends: SymptomTrend[] = [];
  const symptomData = new Map<string, { logs: SymptomLog[]; categoryId: string }>();

  logs.forEach(log => {
    const existing = symptomData.get(log.symptomId);
    if (existing) {
      existing.logs.push(log);
    } else {
      symptomData.set(log.symptomId, { logs: [log], categoryId: log.categoryId });
    }
  });

  symptomData.forEach((data, symptomId) => {
    const category = getCategoryById(data.categoryId);
    const symptom = category?.items.find(i => i.id === symptomId);

    if (!symptom) return;

    const sortedLogs = data.logs.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const midpoint = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, midpoint);
    const secondHalf = sortedLogs.slice(midpoint);

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalf.length > firstHalf.length * 1.3) {
      trend = 'increasing';
    } else if (firstHalf.length > secondHalf.length * 1.3) {
      trend = 'decreasing';
    }

    const severities = data.logs
      .map(l => l.severity || 0)
      .filter(s => s > 0);
    const avgSeverity = severities.length > 0
      ? severities.reduce((a, b) => a + b, 0) / severities.length
      : 0;

    trends.push({
      symptomId,
      symptomName: symptom.name,
      categoryId: data.categoryId,
      frequency: data.logs.length,
      averageSeverity: Math.round(avgSeverity * 10) / 10,
      trend,
    });
  });

  return trends.sort((a, b) => b.frequency - a.frequency);
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "hydration" | "rest" | "exercise" | "nutrition" | "relaxation" | "medical";
  triggers: string[];
  phase?: string;
  icon: string;
}

export function generateRecommendations(
  logs: SymptomLog[],
  cycleDay: number,
  cycleLength: number = 28
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  const symptomCounts = new Map<string, number>();
  logs.forEach(log => {
    symptomCounts.set(log.symptomId, (symptomCounts.get(log.symptomId) || 0) + 1);
  });

  // Bloating recommendations
  if ((symptomCounts.get('bloating') || 0) >= 2) {
    recommendations.push({
      id: 'bloating-hydration',
      title: 'Hydration for Bloating',
      description: 'Increase water intake and reduce sodium to help with bloating. Herbal teas like peppermint may also help.',
      category: 'hydration',
      triggers: ['bloating'],
      icon: 'droplet',
    });
  }

  // Fatigue recommendations
  const fatigueCount = ['fatigue-mild', 'fatigue-moderate', 'fatigue-extreme', 'afternoon-crash']
    .reduce((sum, id) => sum + (symptomCounts.get(id) || 0), 0);
  
  if (fatigueCount >= 3) {
    recommendations.push({
      id: 'fatigue-rest',
      title: 'Honor Your Rest Needs',
      description: 'Your body is signaling a need for rest. Schedule lighter activities and aim for 7-9 hours of sleep.',
      category: 'rest',
      triggers: ['fatigue'],
      icon: 'moon',
    });
  }

  // Cramps recommendations
  const crampsLogs = logs.filter(l => l.symptomId === 'cramps');
  const avgCrampsSeverity = crampsLogs.length > 0 
    ? crampsLogs.reduce((sum, l) => sum + (l.severity || 0), 0) / crampsLogs.length 
    : 0;
  
  if (avgCrampsSeverity >= 2) {
    recommendations.push({
      id: 'cramps-relief',
      title: 'Cramp Relief Strategies',
      description: 'Apply heat to your lower abdomen, try gentle stretches, and consider magnesium-rich foods like dark chocolate and leafy greens.',
      category: 'relaxation',
      triggers: ['cramps'],
      phase: 'menstrual',
      icon: 'heart',
    });
  }

  // Mood-related recommendations
  const moodSymptoms = ['low-mood', 'anxious', 'irritable', 'tearful'];
  const moodCount = moodSymptoms.reduce((sum, id) => sum + (symptomCounts.get(id) || 0), 0);
  
  if (moodCount >= 2) {
    recommendations.push({
      id: 'mood-support',
      title: 'Mood Support',
      description: 'Gentle movement like walking or yoga can help stabilize mood. Sunlight exposure and connecting with loved ones also help.',
      category: 'exercise',
      triggers: ['mood'],
      icon: 'sun',
    });
  }

  // Sugar cravings
  if ((symptomCounts.get('sugar-cravings') || 0) >= 2) {
    recommendations.push({
      id: 'cravings-nutrition',
      title: 'Balance Blood Sugar',
      description: 'Pair carbs with protein and healthy fats. Slow-burning foods like oats and sweet potatoes can help reduce cravings.',
      category: 'nutrition',
      triggers: ['cravings'],
      phase: 'luteal',
      icon: 'coffee',
    });
  }

  // Phase-specific recommendations
  const menstrualEnd = 5;
  const follicularEnd = Math.round(cycleLength * 0.35);
  const ovulationEnd = Math.round(cycleLength * 0.55);

  if (cycleDay <= menstrualEnd) {
    recommendations.push({
      id: 'menstrual-nutrition',
      title: 'Iron-Rich Foods',
      description: 'Support blood loss recovery with iron-rich foods like spinach, lentils, and fortified cereals. Vitamin C helps absorption.',
      category: 'nutrition',
      triggers: ['menstrual-phase'],
      phase: 'menstrual',
      icon: 'coffee',
    });
  } else if (cycleDay > follicularEnd && cycleDay <= ovulationEnd) {
    recommendations.push({
      id: 'ovulation-exercise',
      title: 'High Energy Window',
      description: 'Your energy is naturally higher now. Great time for challenging workouts and ambitious projects.',
      category: 'exercise',
      triggers: ['ovulation-phase'],
      phase: 'ovulation',
      icon: 'zap',
    });
  } else if (cycleDay > ovulationEnd) {
    recommendations.push({
      id: 'luteal-relaxation',
      title: 'Wind Down Time',
      description: 'Progesterone rises, which can feel calming but also cause PMS symptoms. Prioritize stress management and gentle activities.',
      category: 'relaxation',
      triggers: ['luteal-phase'],
      phase: 'luteal',
      icon: 'sunset',
    });
  }

  return recommendations;
}
