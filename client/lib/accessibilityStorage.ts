import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@olanna_accessibility";

export interface AccessibilitySettings {
  fontScale: number; // 0.8, 1.0, 1.2, 1.4
  reducedMotion: boolean;
  highContrast: boolean;
  voiceoverOptimized: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: 1.0,
  reducedMotion: false,
  highContrast: false,
  voiceoverOptimized: false,
};

export const accessibilityStorage = {
  async getSettings(): Promise<AccessibilitySettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: Partial<AccessibilitySettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async getFontScale(): Promise<number> {
    const settings = await this.getSettings();
    return settings.fontScale;
  },

  async setFontScale(scale: number): Promise<void> {
    await this.saveSettings({ fontScale: scale });
  },
};

export const FONT_SCALE_OPTIONS = [
  { value: 0.85, label: "Small" },
  { value: 1.0, label: "Default" },
  { value: 1.15, label: "Large" },
  { value: 1.3, label: "Extra Large" },
];
