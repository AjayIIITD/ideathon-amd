"use client";

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Minus, Sparkles, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { NutritionRecommendation } from "@/lib/api/nutritionRecommendation";

interface Props {
  recommendation: NutritionRecommendation | null;
  loading: boolean;
  error?: string | null;
}

const VERDICT_CONFIG = {
  eat: {
    icon: ThumbsUp,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
  },
  avoid: {
    icon: ThumbsDown,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  },
  moderate: {
    icon: Minus,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
};

export default function NutritionRecommendationCard({ recommendation: rec, loading, error }: Props) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex flex-col items-center gap-3 border border-primary/20"
      >
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">NutriAI is analysing your profile…</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error || !rec) {
    return null; // Silently skip if recommendation fails — don't break the UX
  }

  const cfg = VERDICT_CONFIG[rec.verdict];
  const Icon = cfg.icon;
  const impactPositive = rec.healthScoreImpact >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("rounded-3xl border p-5 space-y-4", cfg.bg, cfg.border, cfg.glow)}
    >
      {/* Header: badge + verdict label */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">NutriAI Recommendation</span>
        </div>
        <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", cfg.badge)}>
          <Icon className="w-3.5 h-3.5" />
          {rec.verdictLabel}
        </span>
      </div>

      {/* Tagline */}
      <p className={cn("text-base font-semibold leading-snug", cfg.text)}>{rec.tagline}</p>

      {/* Reasoning */}
      <p className="text-sm text-white/80 leading-relaxed">{rec.reasoning}</p>

      {/* Pros */}
      {rec.pros.length > 0 && (
        <div className="space-y-1.5">
          {rec.pros.map((pro, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/75">
              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
              <span>{pro}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cons */}
      {rec.cons.length > 0 && (
        <div className="space-y-1.5">
          {rec.cons.map((con, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/75">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>
              <span>{con}</span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Health score impact + tip */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 uppercase tracking-wider">Health Score Impact</span>
          <div className={cn("flex items-center gap-1 font-bold text-sm", impactPositive ? "text-emerald-400" : "text-red-400")}>
            {impactPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {impactPositive ? "+" : ""}{rec.healthScoreImpact} pts
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-white/5 rounded-xl p-3 border border-white/10">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-white/70 leading-relaxed">{rec.tips}</p>
        </div>
      </div>
    </motion.div>
  );
}
