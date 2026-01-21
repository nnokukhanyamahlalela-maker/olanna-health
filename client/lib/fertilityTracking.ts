import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  FERTILITY_DATA: "@olanna_fertility_data",
  BBT_LOGS: "@olanna_bbt_logs",
  MUCUS_LOGS: "@olanna_mucus_logs",
  LH_TESTS: "@olanna_lh_tests",
  HORMONE_LOGS: "@olanna_hormone_logs",
  OVULATION_OVERRIDE: "@olanna_ovulation_override",
};

export type CervicalMucusType = "dry" | "sticky" | "creamy" | "watery" | "egg-white";
export type LHTestResult = "negative" | "low" | "high" | "peak";
export type HormoneType = "estrogen" | "progesterone" | "lh" | "fsh";

export interface BBTEntry {
  id: string;
  date: string;
  temperature: number;
  unit: "celsius" | "fahrenheit";
  time: string;
  notes?: string;
  timestamp: number;
}

export interface CervicalMucusEntry {
  id: string;
  date: string;
  type: CervicalMucusType;
  amount: "none" | "light" | "moderate" | "heavy";
  notes?: string;
  timestamp: number;
}

export interface LHTestEntry {
  id: string;
  date: string;
  result: LHTestResult;
  brand?: string;
  time: string;
  imageUri?: string;
  notes?: string;
  timestamp: number;
}

export interface HormoneEntry {
  id: string;
  date: string;
  hormoneType: HormoneType;
  value: number;
  unit: string;
  source: "lab" | "home-test";
  notes?: string;
  timestamp: number;
}

export interface FertilityWindow {
  startDate: string;
  endDate: string;
  peakFertilityDate: string;
  confidence: "low" | "medium" | "high";
  indicators: string[];
}

export interface OvulationOverride {
  date: string;
  confirmed: boolean;
  source: "user" | "lh-test" | "bbt-shift" | "mucus";
  notes?: string;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const fertilityTracking = {
  // BBT (Basal Body Temperature)
  async getBBTLogs(startDate?: string, endDate?: string): Promise<BBTEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BBT_LOGS);
      const logs: BBTEntry[] = data ? JSON.parse(data) : [];
      
      if (startDate && endDate) {
        return logs.filter(log => log.date >= startDate && log.date <= endDate);
      }
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },

  async saveBBTEntry(entry: Omit<BBTEntry, "id" | "timestamp">): Promise<BBTEntry> {
    const logs = await this.getBBTLogs();
    const newEntry: BBTEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    // Replace if same date exists
    const existingIndex = logs.findIndex(l => l.date === entry.date);
    if (existingIndex >= 0) {
      logs[existingIndex] = newEntry;
    } else {
      logs.push(newEntry);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.BBT_LOGS, JSON.stringify(logs));
    return newEntry;
  },

  async deleteBBTEntry(id: string): Promise<void> {
    const logs = await this.getBBTLogs();
    const filtered = logs.filter(l => l.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.BBT_LOGS, JSON.stringify(filtered));
  },

  // Cervical Mucus
  async getMucusLogs(startDate?: string, endDate?: string): Promise<CervicalMucusEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MUCUS_LOGS);
      const logs: CervicalMucusEntry[] = data ? JSON.parse(data) : [];
      
      if (startDate && endDate) {
        return logs.filter(log => log.date >= startDate && log.date <= endDate);
      }
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },

  async saveMucusEntry(entry: Omit<CervicalMucusEntry, "id" | "timestamp">): Promise<CervicalMucusEntry> {
    const logs = await this.getMucusLogs();
    const newEntry: CervicalMucusEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    const existingIndex = logs.findIndex(l => l.date === entry.date);
    if (existingIndex >= 0) {
      logs[existingIndex] = newEntry;
    } else {
      logs.push(newEntry);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.MUCUS_LOGS, JSON.stringify(logs));
    return newEntry;
  },

  // LH Tests
  async getLHTests(startDate?: string, endDate?: string): Promise<LHTestEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LH_TESTS);
      const logs: LHTestEntry[] = data ? JSON.parse(data) : [];
      
      if (startDate && endDate) {
        return logs.filter(log => log.date >= startDate && log.date <= endDate);
      }
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },

  async saveLHTest(entry: Omit<LHTestEntry, "id" | "timestamp">): Promise<LHTestEntry> {
    const logs = await this.getLHTests();
    const newEntry: LHTestEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    logs.push(newEntry);
    await AsyncStorage.setItem(STORAGE_KEYS.LH_TESTS, JSON.stringify(logs));
    return newEntry;
  },

  // Hormone Levels
  async getHormoneLogs(): Promise<HormoneEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HORMONE_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveHormoneEntry(entry: Omit<HormoneEntry, "id" | "timestamp">): Promise<HormoneEntry> {
    const logs = await this.getHormoneLogs();
    const newEntry: HormoneEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    logs.push(newEntry);
    await AsyncStorage.setItem(STORAGE_KEYS.HORMONE_LOGS, JSON.stringify(logs));
    return newEntry;
  },

  // Ovulation Override
  async getOvulationOverride(cycleStart: string): Promise<OvulationOverride | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OVULATION_OVERRIDE);
      const overrides: Record<string, OvulationOverride> = data ? JSON.parse(data) : {};
      return overrides[cycleStart] || null;
    } catch {
      return null;
    }
  },

  async setOvulationOverride(cycleStart: string, override: OvulationOverride): Promise<void> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.OVULATION_OVERRIDE);
    const overrides: Record<string, OvulationOverride> = data ? JSON.parse(data) : {};
    overrides[cycleStart] = override;
    await AsyncStorage.setItem(STORAGE_KEYS.OVULATION_OVERRIDE, JSON.stringify(overrides));
  },

  // Calculate fertility window using multiple indicators
  async calculateFertilityWindow(
    cycleStart: string,
    cycleLength: number,
    useLH: boolean = true,
    useBBT: boolean = true,
    useMucus: boolean = true
  ): Promise<FertilityWindow> {
    const indicators: string[] = [];
    let peakDate: string | null = null;
    let confidence: "low" | "medium" | "high" = "low";
    
    const startDateObj = new Date(cycleStart);
    
    // Default rhythm method calculation
    const defaultOvulationDay = Math.round(cycleLength / 2) - 1;
    let ovulationDate = new Date(startDateObj);
    ovulationDate.setDate(ovulationDate.getDate() + defaultOvulationDay);
    
    // Get LH test data for this cycle
    if (useLH) {
      const lhTests = await this.getLHTests(cycleStart, this.addDays(cycleStart, cycleLength));
      const peakLH = lhTests.find(t => t.result === "peak");
      if (peakLH) {
        ovulationDate = new Date(peakLH.date);
        ovulationDate.setDate(ovulationDate.getDate() + 1); // Ovulation typically 12-36h after peak
        indicators.push("LH surge detected");
        confidence = "high";
        peakDate = peakLH.date;
      } else if (lhTests.some(t => t.result === "high")) {
        indicators.push("LH rising");
        confidence = "medium";
      }
    }

    // Check BBT for thermal shift
    if (useBBT) {
      const bbtLogs = await this.getBBTLogs(cycleStart, this.addDays(cycleStart, cycleLength));
      if (bbtLogs.length >= 6) {
        const shift = this.detectBBTShift(bbtLogs);
        if (shift) {
          indicators.push("BBT shift detected");
          if (confidence === "low") confidence = "medium";
          if (!peakDate) peakDate = shift.shiftDate;
        }
      }
    }

    // Check cervical mucus
    if (useMucus) {
      const mucusLogs = await this.getMucusLogs(cycleStart, this.addDays(cycleStart, cycleLength));
      const eggWhite = mucusLogs.find(m => m.type === "egg-white");
      if (eggWhite) {
        indicators.push("Fertile mucus observed");
        if (confidence === "low") confidence = "medium";
        if (!peakDate) peakDate = eggWhite.date;
      }
    }

    if (indicators.length === 0) {
      indicators.push("Rhythm method estimate");
    }

    // Fertile window is typically 5 days before ovulation + ovulation day + 1 day after
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    return {
      startDate: fertileStart.toISOString().split("T")[0],
      endDate: fertileEnd.toISOString().split("T")[0],
      peakFertilityDate: ovulationDate.toISOString().split("T")[0],
      confidence,
      indicators,
    };
  },

  detectBBTShift(logs: BBTEntry[]): { shiftDate: string; preBBT: number; postBBT: number } | null {
    if (logs.length < 6) return null;
    
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Look for a 0.2°C (0.4°F) sustained rise for at least 3 days
    for (let i = 3; i < sorted.length - 3; i++) {
      const preBBT = sorted.slice(i - 3, i).reduce((sum, e) => sum + e.temperature, 0) / 3;
      const postBBT = sorted.slice(i, i + 3).reduce((sum, e) => sum + e.temperature, 0) / 3;
      
      const threshold = sorted[0].unit === "celsius" ? 0.2 : 0.4;
      
      if (postBBT - preBBT >= threshold) {
        return {
          shiftDate: sorted[i].date,
          preBBT,
          postBBT,
        };
      }
    }
    
    return null;
  },

  addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  },
};
