import AsyncStorage from '@react-native-async-storage/async-storage';
import { SymptomLog, BodyPainPoint, DailyCheckIn } from './symptomSchema';

const STORAGE_KEYS = {
  SYMPTOM_LOGS: '@olanna_symptom_logs',
  PAIN_POINTS: '@olanna_pain_points',
  DAILY_CHECKINS: '@olanna_daily_checkins',
  FAVORITES: '@olanna_symptom_favorites',
  HIDDEN: '@olanna_symptom_hidden',
  CUSTOM_SYMPTOMS: '@olanna_custom_symptoms',
  CATEGORY_ORDER: '@olanna_category_order',
};

export const saveSymptomLog = async (log: SymptomLog): Promise<void> => {
  try {
    const existingLogs = await getSymptomLogs();
    const updatedLogs = [...existingLogs, log];
    await AsyncStorage.setItem(STORAGE_KEYS.SYMPTOM_LOGS, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error saving symptom log:', error);
    throw error;
  }
};

export const getSymptomLogs = async (): Promise<SymptomLog[]> => {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.SYMPTOM_LOGS);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting symptom logs:', error);
    return [];
  }
};

export const getSymptomLogsByDate = async (date: string): Promise<SymptomLog[]> => {
  const logs = await getSymptomLogs();
  return logs.filter(log => log.date === date);
};

export const getSymptomLogsByDateRange = async (startDate: string, endDate: string): Promise<SymptomLog[]> => {
  const logs = await getSymptomLogs();
  return logs.filter(log => log.date >= startDate && log.date <= endDate);
};

export const savePainPoint = async (painPoint: BodyPainPoint): Promise<void> => {
  try {
    const existingPoints = await getPainPoints();
    const updatedPoints = [...existingPoints, painPoint];
    await AsyncStorage.setItem(STORAGE_KEYS.PAIN_POINTS, JSON.stringify(updatedPoints));
  } catch (error) {
    console.error('Error saving pain point:', error);
    throw error;
  }
};

export const getPainPoints = async (): Promise<BodyPainPoint[]> => {
  try {
    const points = await AsyncStorage.getItem(STORAGE_KEYS.PAIN_POINTS);
    return points ? JSON.parse(points) : [];
  } catch (error) {
    console.error('Error getting pain points:', error);
    return [];
  }
};

export const getPainPointsByDate = async (date: string): Promise<BodyPainPoint[]> => {
  const points = await getPainPoints();
  return points.filter(point => point.date === date);
};

export const saveDailyCheckIn = async (checkIn: DailyCheckIn): Promise<void> => {
  try {
    const existingCheckIns = await getDailyCheckIns();
    const index = existingCheckIns.findIndex(c => c.date === checkIn.date);
    if (index >= 0) {
      existingCheckIns[index] = checkIn;
    } else {
      existingCheckIns.push(checkIn);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHECKINS, JSON.stringify(existingCheckIns));
    try {
      const { pushCycleSnapshot } = require("./partnerSync");
      pushCycleSnapshot();
    } catch {}
  } catch (error) {
    console.error('Error saving daily check-in:', error);
    throw error;
  }
};

export const getDailyCheckIns = async (): Promise<DailyCheckIn[]> => {
  try {
    const checkIns = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHECKINS);
    return checkIns ? JSON.parse(checkIns) : [];
  } catch (error) {
    console.error('Error getting daily check-ins:', error);
    return [];
  }
};

export const getDailyCheckIn = async (date: string): Promise<DailyCheckIn | null> => {
  const checkIns = await getDailyCheckIns();
  return checkIns.find(c => c.date === date) || null;
};

export const getFavoriteSymptoms = async (): Promise<string[]> => {
  try {
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const saveFavoriteSymptoms = async (favorites: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
    throw error;
  }
};

export const getHiddenSymptoms = async (): Promise<string[]> => {
  try {
    const hidden = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN);
    return hidden ? JSON.parse(hidden) : [];
  } catch (error) {
    console.error('Error getting hidden symptoms:', error);
    return [];
  }
};

export const saveHiddenSymptoms = async (hidden: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN, JSON.stringify(hidden));
  } catch (error) {
    console.error('Error saving hidden:', error);
    throw error;
  }
};

export const getCategoryOrder = async (): Promise<string[]> => {
  try {
    const order = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_ORDER);
    return order ? JSON.parse(order) : [];
  } catch (error) {
    console.error('Error getting category order:', error);
    return [];
  }
};

export const saveCategoryOrder = async (order: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_ORDER, JSON.stringify(order));
  } catch (error) {
    console.error('Error saving category order:', error);
    throw error;
  }
};

export const clearAllSymptomData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SYMPTOM_LOGS,
      STORAGE_KEYS.PAIN_POINTS,
      STORAGE_KEYS.DAILY_CHECKINS,
    ]);
  } catch (error) {
    console.error('Error clearing symptom data:', error);
    throw error;
  }
};

export const generateSeedData = async (): Promise<void> => {
  const today = new Date();
  const logs: SymptomLog[] = [];
  const painPoints: BodyPainPoint[] = [];
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const cycleDay = i % 28;
    
    // Menstrual phase (days 0-5)
    if (cycleDay < 5) {
      logs.push({
        id: `seed-${dateStr}-cramps`,
        date: dateStr,
        symptomId: 'cramps',
        categoryId: 'core-cycle',
        value: true,
        severity: cycleDay < 2 ? 4 : Math.floor(Math.random() * 2) + 2,
        tags: cycleDay < 2 ? ['poor sleep'] : undefined,
        timestamp: date.getTime(),
      });
      logs.push({
        id: `seed-${dateStr}-flow`,
        date: dateStr,
        symptomId: cycleDay < 2 ? 'flow-heavy' : cycleDay < 4 ? 'flow-medium' : 'flow-light',
        categoryId: 'flow',
        value: true,
        timestamp: date.getTime(),
      });
      logs.push({
        id: `seed-${dateStr}-fatigue`,
        date: dateStr,
        symptomId: cycleDay < 2 ? 'fatigue-extreme' : 'fatigue-moderate',
        categoryId: 'core-cycle',
        value: true,
        timestamp: date.getTime(),
      });
      if (cycleDay < 3) {
        logs.push({
          id: `seed-${dateStr}-low-mood`,
          date: dateStr,
          symptomId: 'low-mood',
          categoryId: 'emotional',
          value: true,
          severity: 2,
          timestamp: date.getTime(),
        });
        painPoints.push({
          id: `seed-${dateStr}-pelvic`,
          date: dateStr,
          region: 'pelvic',
          painType: 'cramping',
          severity: 3,
          duration: 'hours',
          timestamp: date.getTime(),
        });
      }
    }
    
    // Follicular phase (days 6-13) - rising energy
    if (cycleDay >= 6 && cycleDay < 14) {
      if (cycleDay === 6 || cycleDay === 7) {
        logs.push({
          id: `seed-${dateStr}-spotting`,
          date: dateStr,
          symptomId: 'spotting',
          categoryId: 'flow',
          value: true,
          timestamp: date.getTime(),
        });
      }
      if (cycleDay > 9) {
        logs.push({
          id: `seed-${dateStr}-energy`,
          date: dateStr,
          symptomId: 'physical-energy-high',
          categoryId: 'energy',
          value: true,
          timestamp: date.getTime(),
        });
        logs.push({
          id: `seed-${dateStr}-clarity`,
          date: dateStr,
          symptomId: 'mental-clarity',
          categoryId: 'cognitive',
          value: true,
          timestamp: date.getTime(),
        });
      }
    }
    
    // Ovulation window (days 14-16)
    if (cycleDay >= 14 && cycleDay < 17) {
      logs.push({
        id: `seed-${dateStr}-cm`,
        date: dateStr,
        symptomId: 'cm-eggwhite',
        categoryId: 'vaginal',
        value: true,
        timestamp: date.getTime(),
      });
      logs.push({
        id: `seed-${dateStr}-libido`,
        date: dateStr,
        symptomId: 'libido-up',
        categoryId: 'sexual',
        value: true,
        timestamp: date.getTime(),
      });
      if (cycleDay === 14) {
        logs.push({
          id: `seed-${dateStr}-ovary`,
          date: dateStr,
          symptomId: Math.random() > 0.5 ? 'left-ovary-pain' : 'right-ovary-pain',
          categoryId: 'pain-mapping',
          value: true,
          severity: 2,
          timestamp: date.getTime(),
        });
      }
    }
    
    // Luteal phase (days 17-27) - PMS symptoms
    if (cycleDay >= 20) {
      logs.push({
        id: `seed-${dateStr}-bloating`,
        date: dateStr,
        symptomId: 'bloating',
        categoryId: 'core-cycle',
        value: true,
        severity: cycleDay > 24 ? 3 : 2,
        timestamp: date.getTime(),
      });
      if (cycleDay > 22) {
        logs.push({
          id: `seed-${dateStr}-irritable`,
          date: dateStr,
          symptomId: 'irritable',
          categoryId: 'emotional',
          value: true,
          severity: cycleDay > 25 ? 3 : 2,
          timestamp: date.getTime(),
        });
        logs.push({
          id: `seed-${dateStr}-cravings`,
          date: dateStr,
          symptomId: 'sugar-cravings',
          categoryId: 'gut',
          value: true,
          timestamp: date.getTime(),
        });
      }
      if (cycleDay > 24) {
        logs.push({
          id: `seed-${dateStr}-breast`,
          date: dateStr,
          symptomId: 'breast-tenderness',
          categoryId: 'core-cycle',
          value: true,
          severity: 2,
          timestamp: date.getTime(),
        });
        logs.push({
          id: `seed-${dateStr}-sleep`,
          date: dateStr,
          symptomId: 'sleep-quality-poor',
          categoryId: 'energy',
          value: true,
          timestamp: date.getTime(),
        });
      }
    }
    
    // Random environmental/stress factors
    if (i % 7 === 0) {
      logs.push({
        id: `seed-${dateStr}-stress`,
        date: dateStr,
        symptomId: 'commute-stress',
        categoryId: 'environmental',
        value: true,
        severity: Math.floor(Math.random() * 2) + 2,
        timestamp: date.getTime(),
      });
    }
    if (i % 10 === 0) {
      logs.push({
        id: `seed-${dateStr}-load`,
        date: dateStr,
        symptomId: 'load-shedding',
        categoryId: 'environmental',
        value: true,
        timestamp: date.getTime(),
      });
    }
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.SYMPTOM_LOGS, JSON.stringify(logs));
  await AsyncStorage.setItem(STORAGE_KEYS.PAIN_POINTS, JSON.stringify(painPoints));
};

export interface CustomSymptom {
  id: string;
  name: string;
  categoryId: string;
  icon: string;
  inputType: 'toggle' | 'severity';
  createdAt: number;
}

export const getCustomSymptoms = async (): Promise<CustomSymptom[]> => {
  try {
    const symptoms = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_SYMPTOMS);
    return symptoms ? JSON.parse(symptoms) : [];
  } catch (error) {
    console.error('Error getting custom symptoms:', error);
    return [];
  }
};

export const saveCustomSymptom = async (symptom: CustomSymptom): Promise<void> => {
  try {
    const existing = await getCustomSymptoms();
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SYMPTOMS, JSON.stringify([...existing, symptom]));
  } catch (error) {
    console.error('Error saving custom symptom:', error);
    throw error;
  }
};

export const deleteCustomSymptom = async (id: string): Promise<void> => {
  try {
    const existing = await getCustomSymptoms();
    const filtered = existing.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SYMPTOMS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom symptom:', error);
    throw error;
  }
};
