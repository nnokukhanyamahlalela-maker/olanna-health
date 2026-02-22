import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "@olanna_device_id";

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }
  } catch {}

  const id = generateId();
  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  } catch {}
  cachedId = id;
  return id;
}
