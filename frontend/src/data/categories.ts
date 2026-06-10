import { PlaceCategory } from "@/types/place";

export interface CategoryInfo {
  id: PlaceCategory;
  label: string;
  colorClass: string; // Tailwind bg color
  accentColor: string; // Tailwind text color
  borderColor: string; // Tailwind border color
  markerColor: string; // Hex color for mapping
}

export const CATEGORIES: Record<PlaceCategory, CategoryInfo> = {
  main_meal: {
    id: "main_meal",
    label: "Main Meal",
    colorClass: "bg-red-500/15 border-red-500/30 text-red-400",
    accentColor: "text-red-400",
    borderColor: "border-red-500/30",
    markerColor: "#ef4444",
  },
  street_food: {
    id: "street_food",
    label: "Street Food",
    colorClass: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    markerColor: "#f59e0b",
  },
  fast_food: {
    id: "fast_food",
    label: "Fast Food",
    colorClass: "bg-orange-500/15 border-orange-500/30 text-orange-400",
    accentColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    markerColor: "#f97316",
  },
  drink: {
    id: "drink",
    label: "Drinks & Juice",
    colorClass: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    accentColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    markerColor: "#0ea5e9",
  },
  dessert: {
    id: "dessert",
    label: "Desserts",
    colorClass: "bg-pink-500/15 border-pink-500/30 text-pink-400",
    accentColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    markerColor: "#ec4899",
  },
  coffee: {
    id: "coffee",
    label: "Coffee Shops",
    colorClass: "bg-yellow-600/15 border-yellow-600/30 text-yellow-500",
    accentColor: "text-yellow-500",
    borderColor: "border-yellow-600/30",
    markerColor: "#ca8a04",
  },
  bar: {
    id: "bar",
    label: "Bars & Pubs",
    colorClass: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    markerColor: "#a855f7",
  },
  attraction: {
    id: "attraction",
    label: "Attractions",
    colorClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    markerColor: "#10b981",
  },
};
