"use client";

import { PlaceCategory } from "@/types/place";
import { CATEGORIES } from "@/data/categories";
import { Search, RotateCcw, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: PlaceCategory[];
  setSelectedCategories: (categories: PlaceCategory[]) => void;
  visitedFilter: "all" | "visited" | "unvisited";
  setVisitedFilter: (filter: "all" | "visited" | "unvisited") => void;
  priceFilter: number | null;
  setPriceFilter: (price: number | null) => void;
  onClearFilters: () => void;
}

export default function FilterPanel({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  visitedFilter,
  setVisitedFilter,
  priceFilter,
  setPriceFilter,
  onClearFilters,
}: FilterPanelProps) {
  const { t } = useLanguage();
  
  const handleCategoryToggle = (category: PlaceCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const isAnyFilterActive =
    searchQuery !== "" ||
    selectedCategories.length > 0 ||
    visitedFilter !== "all" ||
    priceFilter !== null;

  return (
    <div className="flex flex-col gap-5 bg-zinc-50 p-4 rounded-xl border border-zinc-200 shadow-sm">
      
      {/* Header with Clear button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("sidebar.searchFilters")}</h3>
        {isAnyFilterActive && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-500 transition-all duration-200 font-bold active:scale-95 hover:scale-[1.03] group"
          >
            <RotateCcw className="w-3 h-3 transition-transform duration-500 group-hover:-rotate-180" />
            <span>{t("sidebar.reset")}</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("sidebar.searchPlaceholder")}
          className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500/50 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-800 placeholder-zinc-400 outline-none transition-all duration-200 focus:shadow-sm"
        />
      </div>

      {/* Visited Toggle Selectors */}
      <div>
        <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-2">{t("sidebar.visitStatus")}</span>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 border border-zinc-200 rounded-lg">
          {(["all", "unvisited", "visited"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setVisitedFilter(filter)}
              className={`py-1.5 rounded-md text-[11px] font-bold capitalize transition-all duration-200 active:scale-95 hover:scale-[1.02] ${
                visitedFilter === filter
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-white/50"
              }`}
            >
              {t(`sidebar.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Filters */}
      <div>
        <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-2">{t("sidebar.categories")}</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(CATEGORIES).map((cat) => {
            const isActive = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs border font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm ${
                  isActive
                    ? cat.colorClass + " border-current shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-650 hover:border-zinc-350 hover:text-zinc-800"
                }`}
              >
                {t(`category.${cat.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price filter */}
      <div>
        <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-2">{t("sidebar.priceLevel")}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPriceFilter(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
              priceFilter === null
                ? "bg-zinc-200 border-zinc-300 text-zinc-800"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-350 hover:text-zinc-800"
            }`}
          >
            {t("sidebar.all")}
          </button>
          {[1, 2, 3, 4].map((level) => {
            const isActive = priceFilter === level;
            return (
              <button
                key={level}
                onClick={() => setPriceFilter(level)}
                className={`flex items-center justify-center p-1.5 rounded-lg border w-9 h-8 transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-700 font-extrabold"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-350 hover:text-zinc-800"
                }`}
                title={`${t("sidebar.priceLevel")} ${level}`}
              >
                {Array.from({ length: level }).map((_, i) => (
                  <DollarSign key={i} className="w-3.5 h-3.5 -mx-0.5 shrink-0 transition-transform duration-200 hover:scale-110" />
                ))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
