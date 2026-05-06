"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateUserProfile } from "@/lib/firebase/users";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
  {
    id: "activityLevel",
    question: "What is your activity level?",
    options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]
  },
  {
    id: "sleepHours",
    question: "How many hours of sleep do you get on average?",
    type: "number",
    min: 4,
    max: 12,
  },
  {
    id: "sleepQuality",
    question: "How would you rate your sleep quality?",
    options: ["Poor", "Fair", "Good", "Excellent"]
  },
  {
    id: "mainGoal",
    question: "What is your main health goal?",
    options: ["Lose Weight", "Build Muscle", "Eat Healthier", "Maintain Weight", "More Energy"]
  },
  {
    id: "dietPreference",
    question: "Do you have any diet preferences?",
    options: ["No Preference", "Vegetarian", "Vegan", "Keto", "Paleo", "Pescatarian"]
  },
  {
    id: "stressLevel",
    question: "How would you rate your typical stress level?",
    options: ["Low", "Moderate", "High", "Very High"]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finish onboarding
      if (!user) return;
      setLoading(true);
      try {
        await updateUserProfile(user.uid, answers);
        router.push("/");
      } catch (error) {
        console.error("Error saving onboarding data", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-12">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card min-h-[300px] flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">{step.question}</h2>
              
              <div className="space-y-3">
                {step.options ? (
                  step.options.map(option => (
                    <button
                      key={option}
                      onClick={() => setAnswers({ ...answers, [step.id]: option })}
                      className={cn(
                        "w-full text-left px-6 py-4 rounded-xl border transition-all",
                        answers[step.id] === option 
                          ? "bg-primary/20 border-primary text-primary" 
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      )}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <span className="text-5xl font-bold text-primary mb-4">
                      {answers[step.id] || 8} <span className="text-xl text-white/50">hrs</span>
                    </span>
                    <input 
                      type="range" 
                      min={step.min} 
                      max={step.max} 
                      value={answers[step.id] || 8}
                      onChange={(e) => setAnswers({ ...answers, [step.id]: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-12">
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className="p-3 text-white/50 hover:text-white disabled:opacity-0 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handleNext}
                disabled={!answers[step.id] && !step.min}
                className="bg-primary text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next"
                )}
                {!loading && currentStep !== ONBOARDING_STEPS.length - 1 && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
