"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockLeaderboard } from "@/lib/mock-data";
import { Trophy, Flame, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LeaderboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white p-4 pt-12 pb-24 md:pt-16 max-w-lg mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Leaderboard</h1>
          <p className="text-white/60">Weekly consistency & health score</p>
        </div>
        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
      </div>

      <div className="glass-card mb-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary font-medium mb-1">Your Rank</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">2nd</span>
              <span className="text-sm text-white/50 mb-1">/ 24 friends</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60 mb-1">Distance to 1st</p>
            <p className="text-lg font-bold text-white">8 pts</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockLeaderboard.map((user, index) => (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl transition-all",
              user.isMe ? "glass border-primary/40 shadow-[0_0_20px_rgba(195,255,0,0.1)]" : "bg-white/5 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-6 font-bold text-center text-white/50">
                {user.rank}
              </div>
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/20" />
              <div>
                <p className={cn("font-semibold", user.isMe && "text-primary")}>
                  {user.name} {user.isMe && "(You)"}
                </p>
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {user.streak} day streak
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-bold text-lg">{user.score}</span>
              </div>
              <div className="w-4 flex justify-center">
                {index === 0 ? <Minus className="w-4 h-4 text-white/30" /> : 
                 index === 1 ? <ChevronUp className="w-4 h-4 text-primary" /> : 
                 <ChevronDown className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
