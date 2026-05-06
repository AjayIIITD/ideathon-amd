export interface DetectedFoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
}

export interface GeminiAnalysisResult {
  foods: DetectedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  healthScore: number;
  isMockAnalysis?: boolean;
}

// ─── Rich Demo Pool ──────────────────────────────────────────────
// Accurate nutrition data for common meals — used when no API key is set.
// Values are per typical single serving / plate.
const DEMO_FOOD_POOL: GeminiAnalysisResult[] = [
  {
    foods: [
      { name: "Dal Makhani", portion: "1 bowl (250g)", calories: 320, protein: 14, carbs: 38, fats: 12, fiber: 9, sugar: 4 },
      { name: "Butter Naan (x2)", portion: "2 pieces (140g)", calories: 280, protein: 7, carbs: 48, fats: 8, fiber: 2, sugar: 3 },
    ],
    totalCalories: 600, totalProtein: 21, totalCarbs: 86, totalFats: 20, totalFiber: 11, totalSugar: 7,
    confidence: 88, confidenceLabel: "High", healthScore: 72, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Chicken Biryani", portion: "1 plate (400g)", calories: 520, protein: 28, carbs: 62, fats: 16, fiber: 4, sugar: 5 },
    ],
    totalCalories: 520, totalProtein: 28, totalCarbs: 62, totalFats: 16, totalFiber: 4, totalSugar: 5,
    confidence: 91, confidenceLabel: "High", healthScore: 68, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Masala Omelette (2 eggs)", portion: "2 eggs + veggies (180g)", calories: 220, protein: 16, carbs: 5, fats: 15, fiber: 1, sugar: 2 },
      { name: "Whole Wheat Toast", portion: "2 slices (70g)", calories: 160, protein: 6, carbs: 30, fats: 2, fiber: 4, sugar: 2 },
    ],
    totalCalories: 380, totalProtein: 22, totalCarbs: 35, totalFats: 17, totalFiber: 5, totalSugar: 4,
    confidence: 93, confidenceLabel: "High", healthScore: 84, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Paneer Butter Masala", portion: "1 bowl (200g)", calories: 380, protein: 18, carbs: 22, fats: 24, fiber: 3, sugar: 8 },
      { name: "Jeera Rice", portion: "1 cup (180g)", calories: 240, protein: 5, carbs: 48, fats: 4, fiber: 1, sugar: 0 },
    ],
    totalCalories: 620, totalProtein: 23, totalCarbs: 70, totalFats: 28, totalFiber: 4, totalSugar: 8,
    confidence: 86, confidenceLabel: "High", healthScore: 65, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Avocado Toast", portion: "2 slices (200g)", calories: 290, protein: 8, carbs: 30, fats: 16, fiber: 7, sugar: 2 },
      { name: "Poached Eggs (x2)", portion: "2 large eggs", calories: 140, protein: 12, carbs: 1, fats: 10, fiber: 0, sugar: 0 },
    ],
    totalCalories: 430, totalProtein: 20, totalCarbs: 31, totalFats: 26, totalFiber: 7, totalSugar: 2,
    confidence: 95, confidenceLabel: "High", healthScore: 88, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Rajma Chawal", portion: "1 plate (350g)", calories: 450, protein: 18, carbs: 72, fats: 8, fiber: 12, sugar: 4 },
    ],
    totalCalories: 450, totalProtein: 18, totalCarbs: 72, totalFats: 8, totalFiber: 12, totalSugar: 4,
    confidence: 89, confidenceLabel: "High", healthScore: 78, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Greek Yogurt Parfait", portion: "1 bowl (300g)", calories: 260, protein: 18, carbs: 34, fats: 5, fiber: 3, sugar: 20 },
      { name: "Granola", portion: "40g", calories: 180, protein: 4, carbs: 28, fats: 6, fiber: 2, sugar: 8 },
    ],
    totalCalories: 440, totalProtein: 22, totalCarbs: 62, totalFats: 11, totalFiber: 5, totalSugar: 28,
    confidence: 90, confidenceLabel: "High", healthScore: 80, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Grilled Chicken Salad", portion: "1 bowl (350g)", calories: 320, protein: 35, carbs: 14, fats: 12, fiber: 5, sugar: 6 },
    ],
    totalCalories: 320, totalProtein: 35, totalCarbs: 14, totalFats: 12, totalFiber: 5, totalSugar: 6,
    confidence: 92, confidenceLabel: "High", healthScore: 92, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Aloo Paratha (x2)", portion: "2 parathas (200g)", calories: 400, protein: 9, carbs: 58, fats: 16, fiber: 4, sugar: 2 },
      { name: "Curd / Yogurt", portion: "1 cup (150g)", calories: 90, protein: 6, carbs: 9, fats: 2, fiber: 0, sugar: 8 },
    ],
    totalCalories: 490, totalProtein: 15, totalCarbs: 67, totalFats: 18, totalFiber: 4, totalSugar: 10,
    confidence: 87, confidenceLabel: "High", healthScore: 70, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Salmon with Veggies", portion: "1 fillet + 150g veggies", calories: 380, protein: 40, carbs: 18, fats: 16, fiber: 6, sugar: 5 },
    ],
    totalCalories: 380, totalProtein: 40, totalCarbs: 18, totalFats: 16, totalFiber: 6, totalSugar: 5,
    confidence: 94, confidenceLabel: "High", healthScore: 95, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Chole Bhature", portion: "2 bhature + 1 bowl chole (400g)", calories: 680, protein: 20, carbs: 88, fats: 28, fiber: 10, sugar: 5 },
    ],
    totalCalories: 680, totalProtein: 20, totalCarbs: 88, totalFats: 28, totalFiber: 10, totalSugar: 5,
    confidence: 91, confidenceLabel: "High", healthScore: 55, isMockAnalysis: true,
  },
  {
    foods: [
      { name: "Oats Porridge", portion: "1 bowl (250ml)", calories: 220, protein: 8, carbs: 38, fats: 4, fiber: 5, sugar: 6 },
      { name: "Banana", portion: "1 medium", calories: 90, protein: 1, carbs: 23, fats: 0, fiber: 3, sugar: 14 },
    ],
    totalCalories: 310, totalProtein: 9, totalCarbs: 61, totalFats: 4, totalFiber: 8, totalSugar: 20,
    confidence: 96, confidenceLabel: "High", healthScore: 86, isMockAnalysis: true,
  },
];

function getRandomDemoResult(): GeminiAnalysisResult {
  return DEMO_FOOD_POOL[Math.floor(Math.random() * DEMO_FOOD_POOL.length)];
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeImageWithGemini(imageFile: File): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No NEXT_PUBLIC_GEMINI_API_KEY set. Using demo data.");
    await new Promise((r) => setTimeout(r, 1800));
    return DEMO_RESULT;
  }

  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/heic";

  const prompt = `You are a professional nutritionist AI. Analyze this food image and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:

{
  "foods": [
    {
      "name": "food item name",
      "portion": "estimated portion (e.g. '1 cup', '200g', '1 slice')",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fats": <number in grams>,
      "fiber": <number in grams>,
      "sugar": <number in grams>
    }
  ],
  "totalCalories": <sum of all calories>,
  "totalProtein": <sum of all protein>,
  "totalCarbs": <sum of all carbs>,
  "totalFats": <sum of all fats>,
  "totalFiber": <sum of all fiber>,
  "totalSugar": <sum of all sugar>,
  "confidence": <integer 0-100>,
  "confidenceLabel": "<one of: High, Medium, Low>",
  "healthScore": <integer 0-100>
}

If you cannot identify food, return the same structure with all zeros and empty foods array.`;

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Image } },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      }
    );
  } catch (err) {
    console.error("Gemini network error, using demo mode:", err);
    return DEMO_RESULT;
  }

  if (!response.ok) {
    console.error(`Gemini API error ${response.status}, using demo mode.`);
    return DEMO_RESULT;
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Gemini returned non-JSON:", rawText);
    return DEMO_RESULT;
  }

  try {
    const result: GeminiAnalysisResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch {
    return DEMO_RESULT;
  }
}
