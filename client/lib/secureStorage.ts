import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SECURE_PREFIX = "@olanna_secure_";
const CHUNK_SIZE = 1800;
const isWeb = Platform.OS === "web";

async function secureSet(key: string, value: string): Promise<void> {
  const fullKey = SECURE_PREFIX + key;

  if (isWeb) {
    await AsyncStorage.setItem(fullKey, value);
    return;
  }

  const chunks = Math.ceil(value.length / CHUNK_SIZE);

  if (chunks <= 1) {
    await SecureStore.setItemAsync(fullKey, value);
    await SecureStore.deleteItemAsync(fullKey + "_chunks").catch(() => {});
    let i = 1;
    while (true) {
      try {
        const existing = await SecureStore.getItemAsync(fullKey + "_" + i);
        if (!existing) break;
        await SecureStore.deleteItemAsync(fullKey + "_" + i);
        i++;
      } catch {
        break;
      }
    }
    return;
  }

  await SecureStore.setItemAsync(fullKey + "_chunks", String(chunks));
  for (let i = 0; i < chunks; i++) {
    const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    await SecureStore.setItemAsync(fullKey + "_" + i, chunk);
  }
  await SecureStore.deleteItemAsync(fullKey).catch(() => {});
}

async function secureGet(key: string): Promise<string | null> {
  const fullKey = SECURE_PREFIX + key;

  if (isWeb) {
    return AsyncStorage.getItem(fullKey);
  }

  const chunksStr = await SecureStore.getItemAsync(fullKey + "_chunks");

  if (chunksStr) {
    const chunks = parseInt(chunksStr, 10);
    let result = "";
    for (let i = 0; i < chunks; i++) {
      const chunk = await SecureStore.getItemAsync(fullKey + "_" + i);
      if (chunk === null) return null;
      result += chunk;
    }
    return result;
  }

  return SecureStore.getItemAsync(fullKey);
}

async function secureDelete(key: string): Promise<void> {
  const fullKey = SECURE_PREFIX + key;

  if (isWeb) {
    await AsyncStorage.removeItem(fullKey);
    return;
  }

  const chunksStr = await SecureStore.getItemAsync(fullKey + "_chunks");
  if (chunksStr) {
    const chunks = parseInt(chunksStr, 10);
    for (let i = 0; i < chunks; i++) {
      await SecureStore.deleteItemAsync(fullKey + "_" + i).catch(() => {});
    }
    await SecureStore.deleteItemAsync(fullKey + "_chunks").catch(() => {});
  }

  await SecureStore.deleteItemAsync(fullKey).catch(() => {});
}

export type { UserProfile, CycleData, DailyLog } from "./storage";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await secureGet(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await secureSet(key, value);
    } catch {
      await AsyncStorage.setItem(SECURE_PREFIX + key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await secureDelete(key);
    } catch {
      await AsyncStorage.removeItem(SECURE_PREFIX + key);
    }
  },

  async getUserProfile(): Promise<any | null> {
    try {
      const data = await secureGet("user_profile");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUserProfile(profile: any): Promise<void> {
    try {
      await secureSet("user_profile", JSON.stringify(profile));
    } catch {
      await AsyncStorage.setItem(
        SECURE_PREFIX + "user_profile",
        JSON.stringify(profile)
      );
    }
  },

  async getCycleData(): Promise<any | null> {
    try {
      const data = await secureGet("cycle_data");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCycleData(cycleData: any): Promise<void> {
    try {
      await secureSet("cycle_data", JSON.stringify(cycleData));
    } catch {
      await AsyncStorage.setItem(
        SECURE_PREFIX + "cycle_data",
        JSON.stringify(cycleData)
      );
    }
  },

  async getDailyLogs(): Promise<any[]> {
    try {
      const data = await secureGet("daily_logs");
      if (data) return JSON.parse(data);
      const fallbackKey = SECURE_PREFIX + "daily_logs";
      const fallbackData = await AsyncStorage.getItem(fallbackKey);
      if (fallbackData) return JSON.parse(fallbackData);
      return [];
    } catch {
      try {
        const fallbackKey = SECURE_PREFIX + "daily_logs";
        const fallbackData = await AsyncStorage.getItem(fallbackKey);
        if (fallbackData) return JSON.parse(fallbackData);
      } catch {}
      return [];
    }
  },

  async addDailyLog(log: any): Promise<void> {
    try {
      const logs = await this.getDailyLogs();
      const existingIndex = logs.findIndex(
        (l: any) => l.date === log.date
      );
      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }
      await secureSet("daily_logs", JSON.stringify(logs));
    } catch {
      const fallbackKey = SECURE_PREFIX + "daily_logs";
      const existing = await AsyncStorage.getItem(fallbackKey);
      const logs = existing ? JSON.parse(existing) : [];
      const existingIndex = logs.findIndex(
        (l: any) => l.date === log.date
      );
      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }
      await AsyncStorage.setItem(fallbackKey, JSON.stringify(logs));
    }
  },

  async clearAllSecureData(): Promise<void> {
    const keys = ["user_profile", "cycle_data", "daily_logs"];
    for (const key of keys) {
      try {
        await secureDelete(key);
      } catch {
        await AsyncStorage.removeItem(SECURE_PREFIX + key);
      }
    }
  },
};
