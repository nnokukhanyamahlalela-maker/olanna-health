import { CycleProfile } from "../types/cycle";

const cycleProfileStore = new Map<string, CycleProfile>();

export async function saveOnboardingCycleProfile(
  profile: Omit<CycleProfile, "updatedAt">
): Promise<CycleProfile> {
  const savedProfile: CycleProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  cycleProfileStore.set(profile.userId, savedProfile);
  return savedProfile;
}

export async function getCycleProfile(userId: string): Promise<CycleProfile | null> {
  return cycleProfileStore.get(userId) || null;
}
