import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  PARTNER_TOKEN: "@olanna_partner_token",
  PARTNER_ROLE: "@olanna_partner_role",
  PARTNER_LINKED: "@olanna_partner_linked",
  PARTNER_LINKED_AT: "@olanna_partner_linked_at",
};

export type PartnerRole = "primary" | "partner" | "none";

export async function getPartnerRole(): Promise<PartnerRole> {
  try {
    const role = await AsyncStorage.getItem(KEYS.PARTNER_ROLE);
    if (role === "primary" || role === "partner") return role;
    return "none";
  } catch {
    return "none";
  }
}

export async function setPartnerRole(role: PartnerRole): Promise<void> {
  await AsyncStorage.setItem(KEYS.PARTNER_ROLE, role);
}

export async function getPartnerToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.PARTNER_TOKEN);
  } catch {
    return null;
  }
}

export async function savePartnerToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PARTNER_TOKEN, token);
  await setPartnerRole("partner");
  await AsyncStorage.setItem(KEYS.PARTNER_LINKED, "true");
}

export async function isPartnerLinked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.PARTNER_LINKED)) === "true";
  } catch {
    return false;
  }
}

export async function setPartnerLinked(linked: boolean, linkedAt?: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PARTNER_LINKED, linked ? "true" : "false");
  if (linkedAt) {
    await AsyncStorage.setItem(KEYS.PARTNER_LINKED_AT, linkedAt);
  }
  if (linked) {
    const role = await getPartnerRole();
    if (role === "none") await setPartnerRole("primary");
  }
}

export async function getPartnerLinkedAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.PARTNER_LINKED_AT);
  } catch {
    return null;
  }
}

export async function clearPartnerData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
