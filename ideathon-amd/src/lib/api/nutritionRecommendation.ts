import { UserProfile } from "@/types";

export interface NutritionRecommendation {
  verdict: "eat" | "avoid" | "moderate";
  verdictLabel: string;
  tagline: string;          // 1-liner shown on the badge
  reasoning: string;        // 2-3 sentence personal explanation
  pros: string[];           // 2-3 bullet points
  cons: string[];           // 1-2 bullet points (empty if verdict is "eat")
  healthScoreImpact: number; // -10 to +10
  tips: string;             // one actionable suggestion
}

// ─── Mock fallback ───────────────────────────────────────────────
function buildMockRecommendation(
  foods: string[],
  calories: number,
  protein: number,
  goal?: string
): NutritionRecommendation {
  const isHighProtein = protein > 20;
  const isHighCal = calories > 600;
  const foodName = foods[0] ?? "this meal";

  if (goal === "Build Muscle" && isHighProtein) {
    return {
      verdict: "eat",
      verdictLabel: "Great Choice",
      tagline: "Solid fuel for muscle growth 💪",
      reasoning: `${foodName} delivers a strong protein punch that directly supports your muscle-building goal. Consuming this after a workout window is especially effective.`,
      pros: ["High protein supports muscle repair", "Good calorie density for active individuals", "Keeps you satiated longer"],
      cons: [],
      healthScoreImpact: 7,
      tips: "Pair with a post-workout glass of water and a piece of fruit for optimal glycogen replenishment.",
    };
  }

  if (goal === "Lose Weight" && isHighCal) {
    return {
      verdict: "moderate",
      verdictLabel: "Eat Mindfully",
      tagline: "Watch your portion size ⚖️",
      reasoning: `While ${foodName} contains useful nutrients, its calorie count may push you over your daily target if you're aiming to lose weight. Consider a smaller portion or a lighter side.`,
      pros: ["Contains beneficial nutrients", "Provides steady energy"],
      cons: ["High calories could exceed daily budget", "May slow weight-loss progress if eaten frequently"],
      healthScoreImpact: 0,
      tips: "Try eating half the portion and adding a side salad to stay full with fewer calories.",
    };
  }

  return {
    verdict: "eat",
    verdictLabel: "Good Choice",
    tagline: "Fits well with your lifestyle 🌿",
    reasoning: `${foodName} is a balanced option that aligns with your current health profile. It provides a good mix of macronutrients to support your daily energy needs.`,
    pros: ["Balanced macronutrient profile", "Supports consistent energy levels", "Compatible with your diet preference"],
    cons: [],
    healthScoreImpact: 5,
    tips: "Stay hydrated throughout the day to maximize nutrient absorption from this meal.",
  };
}

// ─── Gemini API call ─────────────────────────────────────────────
export async function getPersonalizedRecommendation(
  profile: UserProfile,
  foods: string[],
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    healthScore: number;
  }
): Promise<NutritionRecommendation> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1200));
    return buildMockRecommendation(foods, nutrition.calories, nutrition.protein, profile.mainGoal);
  }

  const prompt = `You are a friendly, expert nutritionist AI named NutriAI. A user just logged a meal and wants your personalized advice.

USER PROFILE:
- Name: ${profile.name || "the user"}
- Main Goal: ${profile.mainGoal || "general health"}
- Activity Level: ${profile.activityLevel || "Moderately Active"}
- Diet Preference: ${profile.dietPreference || "No Preference"}
- Sleep: ${profile.sleepHours || 7} hours/night, quality: ${profile.sleepQuality || "Fair"}
- Stress Level: ${profile.stressLevel || "Moderate"}

MEAL LOGGED:
- Foods: ${foods.join(", ")}
- Calories: ${nutrition.calories} kcal
- Protein: ${nutrition.protein}g
- Carbs: ${nutrition.carbs}g
- Fats: ${nutrition.fats}g
- Fiber: ${nutrition.fiber}g
- Sugar: ${nutrition.sugar}g
- AI Health Score: ${nutrition.healthScore}/100

YOUR TASK:
Generate a personalized, supportive nutrition recommendation. Be specific about HOW this meal relates to their actual goal, stress level, sleep, and activity. Avoid being robotic or generic.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "verdict": "<one of: eat, avoid, moderate>",
  "verdictLabel": "<short label, e.g. 'Great Choice', 'Avoid Today', 'Eat Mindfully'>",
  "tagline": "<1 punchy sentence with an emoji that sums up the verdict>",
  "reasoning": "<2-3 personalized sentences explaining why this meal fits or conflicts with their profile>",
  "pros": ["<benefit 1>", "<benefit 2>", "<benefit 3 if applicable>"],
  "cons": ["<drawback 1 if any>", "<drawback 2 if any>"],
  "healthScoreImpact": <integer from -10 to +10>,
  "tips": "<one specific, actionable tip tailored to their goal>"
}`;

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );
  } catch {
    return buildMockRecommendation(foods, nutrition.calories, nutrition.protein, profile.mainGoal);
  }

  if (!response.ok) {
    console.error(`Gemini recommendation API error: ${response.status}. Falling back to mock.`);
    return buildMockRecommendation(foods, nutrition.calories, nutrition.protein, profile.mainGoal);
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return buildMockRecommendation(foods, nutrition.calories, nutrition.protein, profile.mainGoal);

  return JSON.parse(match[0]) as NutritionRecommendation;
}
