export const mockUser = {
  name: "Alex Johnson",
  username: "@alexj",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  healthScore: 88,
  streak: 14,
  longestStreak: 21,
  consistency: 92, // percentage
};

export const mockMeals = [
  {
    id: "m1",
    user: mockUser,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    name: "Avocado Toast & Eggs",
    timeLogged: "2 hours ago",
    calories: 420,
    protein: 18,
    carbs: 35,
    fat: 22,
    healthScore: 95,
    likes: 12,
    comments: 3,
  },
  {
    id: "m2",
    user: { ...mockUser, name: "Sarah Smith", username: "@sarahs" },
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    name: "Quinoa Salad Bowl",
    timeLogged: "5 hours ago",
    calories: 380,
    protein: 14,
    carbs: 45,
    fat: 16,
    healthScore: 98,
    likes: 24,
    comments: 5,
  },
  {
    id: "m3",
    user: { ...mockUser, name: "Mike Tyson", username: "@miket" },
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    name: "Pepperoni Pizza",
    timeLogged: "1 day ago",
    calories: 850,
    protein: 30,
    carbs: 90,
    fat: 40,
    healthScore: 45,
    likes: 4,
    comments: 1,
  }
];

export const mockAnalytics = {
  weeklyScore: [
    { day: "Mon", score: 85 },
    { day: "Tue", score: 88 },
    { day: "Wed", score: 92 },
    { day: "Thu", score: 78 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 90 },
    { day: "Sun", score: 88 },
  ],
  macroDistribution: [
    { name: "Protein", value: 30, fill: "#c3ff00" },
    { name: "Carbs", value: 45, fill: "#8884d8" },
    { name: "Fat", value: 25, fill: "#ff4d4d" },
  ]
};

export const mockLeaderboard = [
  { rank: 1, name: "Sarah Smith", score: 96, streak: 45, avatar: "https://i.pravatar.cc/150?u=sarah" },
  { rank: 2, name: "Alex Johnson", score: 88, streak: 14, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", isMe: true },
  { rank: 3, name: "Jessica Alba", score: 82, streak: 8, avatar: "https://i.pravatar.cc/150?u=jessica" },
  { rank: 4, name: "Mike Tyson", score: 65, streak: 2, avatar: "https://i.pravatar.cc/150?u=mike" },
];
