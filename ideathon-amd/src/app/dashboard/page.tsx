"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { mockAnalytics } from "@/lib/mock-data";
import { Sparkles, Flame, Target, Utensils } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-white/60">Your weekly nutrition breakdown</p>
      </div>

      <div className="space-y-6">
        {/* Smart Nudge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex gap-4 items-start shadow-[0_0_20px_rgba(195,255,0,0.05)]"
        >
          <div className="bg-primary/20 p-2 rounded-full text-primary mt-1">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Smart Insight</h3>
            <p className="text-sm text-white/80 mt-1 leading-relaxed">
              Protein intake has been low for 3 days. Try adding a boiled egg or a handful of almonds to your next meal to keep your energy up!
            </p>
          </div>
        </motion.div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-white/60">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="text-3xl font-bold flex items-baseline gap-1">
              {profile.currentStreak} <span className="text-sm font-normal text-white/50">days</span>
            </div>
            <div className="text-xs text-white/50">Best: {profile.longestStreak} days</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
            <div className="flex items-center gap-2 text-white/60 relative z-10">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Avg Score</span>
            </div>
            <div className="text-3xl font-bold text-primary relative z-10">
              {profile.healthScore}
            </div>
            <div className="text-xs text-white/50 relative z-10">Top 15% this week</div>
          </motion.div>
        </div>
        {/* Weekly Score Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Weekly Consistency</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-full">92%</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalytics.weeklyScore}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c3ff00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c3ff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#ffffff50', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#c3ff00' }}
                />
                <Area type="monotone" dataKey="score" stroke="#c3ff00" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Macro Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <h3 className="font-semibold text-lg mb-6">Macro Distribution</h3>
          <div className="flex items-center justify-between">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAnalytics.macroDistribution}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockAnalytics.macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 flex-1 ml-6">
              {mockAnalytics.macroDistribution.map((macro, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.fill }} />
                    <span className="text-white/80">{macro.name}</span>
                  </div>
                  <span className="font-semibold">{macro.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
