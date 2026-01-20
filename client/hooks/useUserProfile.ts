import { useState, useEffect, useCallback } from "react";
import { storage, UserProfile, CycleData, calculateCycleData } from "@/lib/storage";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userProfile, onboarded] = await Promise.all([
        storage.getUserProfile(),
        storage.isOnboardingComplete(),
      ]);
      setProfile(userProfile);
      setIsOnboarded(onboarded);
      if (userProfile) {
        const cycle = calculateCycleData(userProfile);
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
    const cycle = calculateCycleData(newProfile);
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
