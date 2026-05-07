"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Edit3, Grid, Bookmark, Award } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth, isMockMode } from "@/lib/firebase/config";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (isMockMode) {
      localStorage.removeItem("mockUserEmail");
      localStorage.removeItem("mockUserName");
      router.push("/auth");
      setTimeout(() => window.location.reload(), 100);
      return;
    }
    await auth.signOut();
    router.push("/auth");
  };

  if (loading || !user || !profile) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white pb-24 max-w-lg mx-auto">
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-black to-black">
        <div className="absolute top-4 right-4 flex gap-4">
          <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-black bg-zinc-900 flex items-center justify-center text-3xl font-bold text-white/50">
              {profile.name?.charAt(0) || "U"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black border-2 border-black hover:scale-105 transition-transform">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 px-6">
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-white/50">{user.email}</p>

        <p className="mt-4 text-sm text-white/80 leading-relaxed">
          {profile.mainGoal ? `Goal: ${profile.mainGoal}` : "On a mission to build a sustainable and healthy eating habit."}
        </p>

        <div className="flex gap-6 mt-6 pb-6 border-b border-white/10">
          <div>
            <span className="font-bold text-lg">{profile.currentStreak}</span>
            <span className="text-white/50 text-sm ml-1">Current Streak</span>
          </div>
          <div>
            <span className="font-bold text-lg">{profile.healthScore}</span>
            <span className="text-white/50 text-sm ml-1">Health Score</span>
          </div>
        </div>

        <div className="flex justify-around mt-4">
          <button className="flex flex-col items-center gap-1 p-2 text-primary border-b-2 border-primary w-full">
            <Grid className="w-5 h-5" />
            <span className="text-xs font-medium">Posts</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white w-full transition-colors">
            <Bookmark className="w-5 h-5" />
            <span className="text-xs font-medium">Saved</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-white/50 hover:text-white w-full transition-colors">
            <Award className="w-5 h-5" />
            <span className="text-xs font-medium">Badges</span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-12 py-4 rounded-xl border border-red-500/30 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </main>
  );
}
