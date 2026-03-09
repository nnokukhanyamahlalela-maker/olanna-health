import { useState, useEffect, useCallback } from "react";
import { storage, UserProfile, CycleData, calculateCycleDataWithLogs } from "@/lib/storage";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userProfile, onboarded, logs] = await Promise.all([
        storage.getUserProfile(),
        storage.isOnboardingComplete(),
        storage.getDailyLogs(),
      ]);
      setProfile(userProfile);
      setIsOnboarded(onboarded);
      if (userProfile) {
        const cycle = calculateCycleDataWithLogs(userProfile, logs);
        setCycleData(cycle);
        await storage.setCycleData(cycle);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (newProfile: UserProfile) => {
    await storage.setUserProfile(newProfile);
    setProfile(newProfile);
    const logs = await storage.getDailyLogs();
    const cycle = calculateCycleDataWithLogs(newProfile, logs);
    setCycleData(cycle);
    await storage.setCycleData(cycle);
  };

  const completeOnboarding = async () => {
    await storage.setOnboardingComplete(true);
    setIsOnboarded(true);
  };

  const logout = async () => {
    await storage.clearAllData();
    setProfile(null);
    setCycleData(null);
    setIsOnboarded(false);
  };

  return {
    profile,
    cycleData,
    isLoading,
    isOnboarded,
    updateProfile,
    completeOnboarding,
    logout,
    refresh: loadProfile,
  };
}
