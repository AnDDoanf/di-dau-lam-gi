"use client";

import { Place } from "@/types/place";
import { CATEGORIES } from "@/data/categories";
import { Check, Plus, Minus, Info, MapPin, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PlaceCardProps {
  place: Place;
  isVisited: boolean;
  isInTour: boolean;
  tourOrderIndex: number; // -1 if not in tour
  onSelect: (place: Place) => void;
  onToggleVisited: () => void;
  onToggleTour: () => void;
}

export default function PlaceCard({
  place,
  isVisited,
  isInTour,
  tourOrderIndex,
  onSelect,
  onToggleVisited,
  onToggleTour,
}: PlaceCardProps) {
  const { t } = useLanguage();
  const cat = CATEGORIES[place.category];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/60 ${
        isInTour
          ? "border-amber-400 bg-amber-50/50 shadow-md shadow-amber-100/30"
          : "border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50/30"
      } ${isVisited ? "opacity-75" : ""}`}
    >
      {/* Background/Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-100/10 -z-10" />

      <div onClick={() => onSelect(place)} className="cursor-pointer">
        {/* Place Image */}
        <div className="relative h-32 w-full overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.imageUrl || "/images/placeholder-food.jpg"}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Category Overlay Pill */}
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border backdrop-blur-md transition-all duration-300 group-hover:scale-105 ${
              cat ? cat.colorClass : "bg-white/90 border-zinc-200 text-zinc-600"
            }`}
          >
            {cat ? t(`category.${cat.id}`) : place.category}
          </span>

          {/* Visited Checkmark overlay */}
          {isVisited && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-750 text-xs font-bold shadow-md transform scale-100 group-hover:scale-105 transition-transform duration-300">
                <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>{t("place.visitedBadge")}</span>
              </span>
            </div>
          )}

          {/* Tour Number overlay */}
          {isInTour && !isVisited && (
            <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-md border border-amber-400 transform scale-100 group-hover:scale-110 transition-transform duration-300">
              {tourOrderIndex + 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
              {place.name}
            </h3>
            
            {/* Price Indicator */}
            {place.priceLevel && (
              <div className="flex items-center text-zinc-355 transition-colors group-hover:text-zinc-400">
                {Array.from({ length: 4 }).map((_, i) => (
                  <DollarSign
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (place.priceLevel || 1) ? "text-amber-500" : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          <p className="flex items-center gap-1 text-[11px] text-zinc-650 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400 transition-colors group-hover:text-amber-500" />
            <span>{place.address}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200/60 text-zinc-600 transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-200/50"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Recommended Preview */}
          {place.recommendedItems && place.recommendedItems.length > 0 && (
            <p className="text-[11px] text-zinc-600 mt-3 border-t border-zinc-100 pt-2 line-clamp-1">
              <span className="text-zinc-405 font-bold">{t("place.try")} </span>
              <span className="text-amber-600 font-bold transition-transform duration-300 hover:translate-x-0.5 inline-block">{place.recommendedItems[0]}</span>
            </p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-100">
          <button
            onClick={() => onSelect(place)}
            className="flex items-center justify-center gap-1 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] font-bold text-zinc-700 border border-zinc-200 transition-all active:scale-95 duration-150 cursor-pointer"
            title="View Details"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t("place.info")}</span>
          </button>

          <button
            onClick={onToggleTour}
            disabled={isVisited}
            className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-bold transition-all active:scale-95 duration-150 border cursor-pointer ${
              isVisited
                ? "bg-zinc-50 text-zinc-350 cursor-not-allowed border-zinc-150"
                : isInTour
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20"
                : "bg-amber-500 hover:bg-amber-600 text-black border-amber-400"
            }`}
          >
            {isInTour ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isInTour ? t("place.remove") : t("place.tour")}</span>
          </button>

          <button
            onClick={onToggleVisited}
            className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-bold border transition-all active:scale-95 duration-150 cursor-pointer ${
              isVisited
                ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isVisited ? t("place.undo") : t("place.visit")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
