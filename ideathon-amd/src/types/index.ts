export interface UserProfile {
  uid: string;
  name: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  sleepHours?: number;
  sleepQuality?: string;
  mainGoal?: string;
  dietPreference?: string;
  stressLevel?: string;
  profilePhoto?: string;
  currentStreak: number;
  longestStreak: number;
  healthScore: number;
  createdAt: number;
}

export interface Meal {
  id?: string;
  userId: string;
  imageURL: string;
  detectedFoods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  userName?: string;
  userAvatar?: string;
  nutritionScore: number;
  mealTimestamp: number;
  createdAt: number;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastMealLoggedAt: number;
  weeklyConsistency: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  weeklyNutritionScore: number;
  weeklyStreak: number;
  rank?: number;
}

export interface AIInsight {
  id?: string;
  userId: string;
  insightText: string;
  insightType: 'positive' | 'warning' | 'info';
  generatedAt: number;
}
