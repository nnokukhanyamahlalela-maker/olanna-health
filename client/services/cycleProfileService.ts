/**
 * Cycle Profile Service
 *
 * This service manages the user's cycle profile — the single source of truth
 * for cycle predictions. It uses an in-memory cache backed by persistent storage.
 *
 * Architecture:
 *   1. During onboarding, saveOnboardingCycleProfile() populates the cache directly.
 *   2. On app restart, getCycleProfile() lazy-hydrates from storage on first call.
 *   3. When the user updates their profile or logs data, storage.ts calls
 *      invalidateCycleProfileCache() so the next read re-hydrates fresh data.
 *
 * The storage backend is injected via setCycleProfileStorageBackend() at app startup
 * (in App.tsx), allowing the service to remain decoupled from the specific storage
 * implementation (SecureStore, AsyncStorage, or a future cloud backend like Supabase).
 */
import { CycleProfile } from "../types/cycle";

// --- In-memory cache state ---
let cachedProfile: CycleProfile | null = null;
let hydratedFromStorage = false;

// --- Storage backend (injected at startup) ---
let storageRef: { getUserProfile: () => Promise<any | null> } | null = null;

/**
 * Inject the storage backend used for hydration.
 * Must be called once at app startup before any getCycleProfile() calls.
 *
 * @param backend - Object with getUserProfile() that returns the persisted UserProfile
 */
export function setCycleProfileStorageBackend(
  backend: { getUserProfile: () => Promise<any | null> }
): void {
  storageRef = backend;
}

/**
 * Convert a UserProfile (from storage) to a CycleProfile.
 * Maps field names: lastPeriodStart → lastPeriodStartDate, etc.
 * Returns null if the profile is missing required fields.
 */
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

/**
 * Lazy hydration: loads the cycle profile from persistent storage on first access.
 * Subsequent calls are no-ops until invalidateCycleProfileCache() resets the flag.
 */
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

/**
 * Save the cycle profile during onboarding.
 * This populates the in-memory cache immediately so that screens can read
 * the profile right after onboarding completes, without waiting for a
 * storage round-trip.
 *
 * IMPORTANT: This also sets hydratedFromStorage=true to prevent a subsequent
 * getCycleProfile() call from re-hydrating and potentially reading stale data
 * or triggering unnecessary storage reads.
 *
 * @param profile - The cycle profile fields (userId, lastPeriodStartDate, etc.)
 * @returns The saved profile with an updatedAt timestamp
 */
export async function saveOnboardingCycleProfile(
  profile: Omit<CycleProfile, "updatedAt">
): Promise<CycleProfile> {
  const savedProfile: CycleProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  // Set the cache directly — no storage write needed because
  // OnboardingScreen already persisted via storage.setUserProfile()
  cachedProfile = savedProfile;

  // Mark as hydrated so getCycleProfile() won't overwrite this cache
  hydratedFromStorage = true;

  return savedProfile;
}

/**
 * Retrieve the current cycle profile.
 * On first call, hydrates from persistent storage. After onboarding,
 * returns the in-memory cache set by saveOnboardingCycleProfile().
 *
 * @param userId - The user's ID. Pass "" to match any cached profile.
 * @returns The CycleProfile or null if no profile exists
 */
export async function getCycleProfile(userId: string): Promise<CycleProfile | null> {
  await hydrateFromStorage();

  if (cachedProfile && userId !== "" && cachedProfile.userId === userId) {
    return cachedProfile;
  }
  return null;
}

/**
 * Invalidate the in-memory cache, forcing the next getCycleProfile() call
 * to re-hydrate from persistent storage.
 *
 * Called automatically by storage.ts when:
 *   - The user profile is updated (setUserProfile)
 *   - A daily log is added or removed (addDailyLog, removeDailyLog)
 *
 * This ensures the hooks always see fresh data after mutations.
 */
export function invalidateCycleProfileCache(): void {
  hydratedFromStorage = false;
  cachedProfile = null;
}
