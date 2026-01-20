import React, { createContext, useContext, ReactNode } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserProfile, CycleData } from "@/lib/storage";

interface UserContextType {
  profile: UserProfile | null;
  cycleData: CycleData | null;
  isLoading: boolean;
  isOnboarded: boolean;
  updateProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userProfile = useUserProfile();

  return (
    <UserContext.Provider value={userProfile}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
