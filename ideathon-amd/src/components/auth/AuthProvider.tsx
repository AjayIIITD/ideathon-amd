"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, isMockMode } from "@/lib/firebase/config";
import { UserProfile } from "@/types";
import { getUserProfile } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      // Simulate mock auth check — deferred to avoid synchronous setState in effect
      const mockEmail = typeof window !== "undefined" ? localStorage.getItem("mockUserEmail") : null;
      queueMicrotask(() => {
        if (mockEmail) {
          setUser({ uid: "mock-uid-123", email: mockEmail } as User);
          setProfile({
            uid: "mock-uid-123",
            name: localStorage.getItem("mockUserName") || "Mock User",
            currentStreak: 5,
            longestStreak: 12,
            healthScore: 88,
            createdAt: Date.now(),
          });
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
