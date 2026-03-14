import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { secureStorage } from "./secureStorage";

const STORAGE_KEYS = {
  PRIVACY_SETTINGS: "@olanna_privacy_settings",
  ANONYMOUS_MODE: "@olanna_anonymous_mode",
  DATA_SHARING_CONSENT: "@olanna_data_sharing",
};

const SENSITIVE_KEYS = [
  "@olanna_partner_token",
  "@olanna_device_id",
];

export interface PrivacySettings {
  anonymousMode: boolean;
  shareAnonymizedData: boolean;
  partnerSyncEnabled: boolean;
  cloudBackupEnabled: boolean;
  dataRetentionMonths: number;
  offlineModePreferred: boolean;
  lowDataMode: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  anonymousMode: false,
  shareAnonymizedData: false,
  partnerSyncEnabled: false,
  cloudBackupEnabled: false,
  dataRetentionMonths: 24,
  offlineModePreferred: false,
  lowDataMode: false,
};

function isOlannaKey(key: string): boolean {
  return key.startsWith("@olanna") || key.startsWith("olanna_");
}

export const privacyStorage = {
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
      return data ? { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(data) } : DEFAULT_PRIVACY_SETTINGS;
    } catch {
      return DEFAULT_PRIVACY_SETTINGS;
    }
  },

  async savePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
    const current = await this.getPrivacySettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(updated));
  },

  async isAnonymousMode(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.anonymousMode;
  },

  async setAnonymousMode(enabled: boolean): Promise<void> {
    await this.savePrivacySettings({ anonymousMode: enabled });
  },

  async exportAllData(): Promise<string> {
    const allKeys = await AsyncStorage.getAllKeys();
    const olannaKeys = allKeys.filter(isOlannaKey);
    const pairs = await AsyncStorage.multiGet(olannaKeys);
    
    const exportData: Record<string, unknown> = {};
    pairs.forEach(([key, value]) => {
      if (value && !SENSITIVE_KEYS.includes(key)) {
        try {
          exportData[key] = JSON.parse(value);
        } catch {
          exportData[key] = value;
        }
      }
    });
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
      data: exportData,
    }, null, 2);
  },

  async shareExportedData(): Promise<boolean> {
    try {
      const exportJson = await this.exportAllData();
      const fileName = `olanna_health_export_${new Date().toISOString().split("T")[0]}.json`;
      const filePath = `${(FileSystem as any).documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, exportJson);
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export Olanna Health Data",
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async deleteSpecificData(category: "cycle" | "symptoms" | "screenings" | "profile" | "all"): Promise<void> {
    const keyMappings: Record<string, string[]> = {
      cycle: [
        "@olanna_cycle_data",
        "@olanna_daily_logs",
        "olanna_cycle_profile",
        "olanna_cycle_logs",
        "@olanna_fertility_data",
        "@olanna_bbt_logs",
        "@olanna_mucus_logs",
        "@olanna_lh_tests",
        "@olanna_hormone_logs",
        "@olanna_ovulation_override",
        "olanna_medication_logs",
        "olanna_supplement_logs",
      ],
      symptoms: [
        "@olanna_symptom_logs",
        "@olanna_pain_points",
        "@olanna_daily_checkins",
        "@olanna_symptom_favorites",
        "@olanna_symptom_hidden",
        "@olanna_custom_symptoms",
        "@olanna_category_order",
      ],
      screenings: ["@olanna_screenings"],
      profile: [
        "@olanna_user_profile",
        "@olanna_health_goals",
        "@olanna_onboarding_complete",
        "@olanna_preferences",
        "@olanna_accessibility",
        "@olanna_app_language",
      ],
      all: [],
    };

    const secureKeyMappings: Record<string, string[]> = {
      cycle: ["cycle_data", "daily_logs"],
      profile: ["user_profile"],
    };

    if (category === "all") {
      const allKeys = await AsyncStorage.getAllKeys();
      const olannaKeys = allKeys.filter(isOlannaKey);
      await AsyncStorage.multiRemove(olannaKeys);
      await secureStorage.clearAllSecureData();
    } else {
      const keysToDelete = keyMappings[category] || [];
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }
      const secureKeys = secureKeyMappings[category];
      if (secureKeys) {
        for (const key of secureKeys) {
          await secureStorage.removeItem(key);
        }
      }
    }
  },

  async getDataSummary(): Promise<Record<string, number>> {
    const allKeys = await AsyncStorage.getAllKeys();
    const olannaKeys = allKeys.filter(isOlannaKey);
    
    const summary: Record<string, number> = {
      totalItems: olannaKeys.length,
      cycleRecords: 0,
      symptomLogs: 0,
      screenings: 0,
    };

    for (const key of olannaKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (key.includes("cycle") || key.includes("daily_logs") || key.includes("fertility") || key.includes("bbt") || key.includes("ovulation") || key.includes("mucus") || key.includes("lh_tests") || key.includes("hormone")) {
            summary.cycleRecords += Array.isArray(parsed) ? parsed.length : 1;
          }
          if (key.includes("symptom") || key.includes("checkin") || key.includes("pain_point")) {
            summary.symptomLogs += Array.isArray(parsed) ? parsed.length : 1;
          }
          if (key.includes("screening")) {
            summary.screenings += Array.isArray(parsed) ? parsed.length : 1;
          }
        } catch {
        }
      }
    }

    return summary;
  },
};
