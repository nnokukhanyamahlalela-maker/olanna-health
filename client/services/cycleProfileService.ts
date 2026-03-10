import { CycleProfile } from "../types/cycle";

let cachedProfile: CycleProfile | null = null;
let hydratedFromStorage = false;
let storageRef: { getUserProfile: () => Promise<any | null> } | null = null;

export function setCycleProfileStorageBackend(
  backend: { getUserProfile: () => Promise<any | null> }
): void {
  storageRef = backend;
}

function userProfileToCycleProfile(p: any): CycleProfile | null {
  if (!p || !p.id || !p.lastPeriodStart) return null;
  return {
    userId: p.id,
    lastPeriodStartDate: p.lastPeriodStart,
    averageCycleLength: p.cycleLength || 28,
    averagePeriodLength: p.periodLength || 5,
    updatedAt: p.createdAt || new Date().toISOString(),
  };
}

async function hydrateFromStorage(): Promise<void> {
  if (hydratedFromStorage) return;
  hydratedFromStorage = true;

  if (!storageRef) return;

  try {
    const userProfile = await storageRef.getUserProfile();
    if (userProfile) {
      const cp = userProfileToCycleProfile(userProfile);
      if (cp) {
        cachedProfile = cp;
      }
    }
  } catch (e) {
    console.error("[cycleProfileService] hydration error:", e);
  }
}

export async function saveOnboardingCycleProfile(
  profile: Omit<CycleProfile, "updatedAt">
): Promise<CycleProfile> {
  const savedProfile: CycleProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  cachedProfile = savedProfile;
  return savedProfile;
}

export async function getCycleProfile(userId: string): Promise<CycleProfile | null> {
  await hydrateFromStorage();

  if (cachedProfile && (userId === "" || cachedProfile.userId === userId)) {
    return cachedProfile;
  }
  return null;
}

export function invalidateCycleProfileCache(): void {
  hydratedFromStorage = false;
  cachedProfile = null;
}
