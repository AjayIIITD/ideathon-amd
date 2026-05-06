"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db, isMockMode } from "@/lib/firebase/config";
import { Meal } from "@/types";
import { mockMeals } from "@/lib/mock-data";

export default function FeedPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    if (isMockMode) {
      // Map mockMeals to the expected Meal interface
      const mockMapped: Meal[] = mockMeals.map(m => ({
        id: m.id.toString(),
        userId: "mock-user",
        imageURL: m.image,
        detectedFoods: [m.name],
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fat,
        fiber: 0,
        sugar: 0,
        nutritionScore: m.healthScore,
        mealTimestamp: Date.now(),
        createdAt: Date.now()
      }));
      setTimeout(() => setMeals(mockMapped), 0);
      return;
    }

    const q = query(collection(db, "meals"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      setMeals(mealsData);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white p-4 pt-12 pb-24 md:pt-16 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Social Feed</h1>
      </div>

      <div className="space-y-8">
        {meals.length === 0 ? (
          <div className="text-center text-white/50 py-12">No meals logged yet. Be the first!</div>
        ) : (
          meals.map((meal, index) => (
            <motion.div 
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-0 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                  <div>
                    <p className="font-semibold">User</p>
                    <p className="text-xs text-white/50">{new Date(meal.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  Score: {meal.nutritionScore}
                </div>
              </div>

              <div className="relative aspect-[4/5] w-full">
                <img src={meal.imageURL} alt="Meal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-xl font-bold text-white shadow-sm">{meal.detectedFoods.join(", ")}</h3>
                  <div className="flex gap-4 mt-2 text-sm font-medium text-white/90">
                    <span>{meal.calories} kcal</span>
                    <span>{meal.protein}g P</span>
                    <span>{meal.carbs}g C</span>
                    <span>{meal.fats}g F</span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <button className="hover:text-primary transition-colors flex items-center gap-1">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="hover:text-primary transition-colors flex items-center gap-1">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="hover:text-primary transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                <button className="hover:text-primary transition-colors">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
