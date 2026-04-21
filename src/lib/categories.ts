export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food & Drink",
    emoji: "🍽️",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  {
    id: "transport",
    label: "Transport",
    emoji: "🚗",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "accommodation",
    label: "Accommodation",
    emoji: "🏠",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎉",
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
  {
    id: "shopping",
    label: "Shopping",
    emoji: "🛒",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    id: "utilities",
    label: "Utilities",
    emoji: "💡",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "health",
    label: "Health",
    emoji: "🏥",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    id: "other",
    label: "Other",
    emoji: "📦",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
];

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
