"use client";

import { Place } from "@/types/place";
import { CATEGORIES } from "@/data/categories";
import { X, Check, Plus, Minus, MapPin, Clock, Utensils, Landmark } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PlaceDetailProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  isVisited: boolean;
  isInTour: boolean;
  onToggleVisited: () => void;
  onToggleTour: () => void;
}

export default function PlaceDetail({
  place,
  isOpen,
  onClose,
  isVisited,
  isInTour,
  onToggleVisited,
  onToggleTour,
}: PlaceDetailProps) {
  const { t } = useLanguage();
  if (!isOpen || !place) return null;

  const cat = CATEGORIES[place.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md h-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-350 animate-out slide-out-to-right">
        
        {/* Banner Cover */}
        <div className="relative h-64 w-full bg-zinc-100 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.imageUrl || "/images/placeholder-food.jpg"}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          {/* Cover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-zinc-100 border border-zinc-200 text-zinc-650 hover:text-zinc-900 transition-all duration-300 active:scale-90 hover:rotate-90 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title on cover */}
          <div className="absolute bottom-4 left-4 right-4">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-bold tracking-wide border backdrop-blur-md mb-2 ${
                cat ? cat.colorClass : "bg-white/90 border-zinc-200 text-zinc-600"
              }`}
            >
              {cat ? t(`category.${cat.id}`) : place.category}
            </span>
            <h2 className="text-2xl font-black text-zinc-900 leading-tight drop-shadow-md">
              {place.name}
            </h2>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          
          {/* Action Row */}
          <div className="flex gap-3 pb-4 border-b border-zinc-100">
            <button
              onClick={onToggleTour}
              disabled={isVisited}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 hover:scale-[1.02] border ${
                isVisited
                  ? "bg-zinc-50 text-zinc-400 cursor-not-allowed border-zinc-150"
                  : isInTour
                  ? "bg-amber-500/10 border border-amber-500/35 text-amber-700 hover:bg-amber-500/20 hover:shadow-md"
                  : "bg-amber-500 hover:bg-amber-600 text-black border border-amber-400 shadow-md hover:shadow-lg hover:shadow-amber-500/10"
              }`}
            >
              {isInTour ? (
                <>
                  <Minus className="w-4 h-4" />
                  <span>{t("place.remove")}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t("place.tour")}</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleVisited}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border transition-all duration-200 active:scale-95 hover:scale-[1.02] hover:shadow-md ${
                isVisited
                  ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-250"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isVisited ? t("tour.unvisited") : t("tour.markVisited")}</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-405 mb-2">{t("place.about")}</h3>
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
              {place.description || "No description provided for this culinary spot."}
            </p>
          </div>

          {/* Location & Contact details */}
          <div className="flex flex-col gap-4 py-4 border-t border-b border-zinc-100 text-sm">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-zinc-800">{t("place.address")}</span>
                <span className="text-zinc-600 text-xs">{place.address || "N/A"}</span>
              </div>
            </div>

            {place.openingHours && (
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-zinc-800">{t("place.hours")}</span>
                  <span className="text-zinc-600 text-xs">{place.openingHours}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Specialties */}
          {place.recommendedItems && place.recommendedItems.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-405 mb-3 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>{t("place.recommendedSpecialties")}</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {place.recommendedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100/40 hover:translate-x-1 group"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 font-black text-[10px] transition-colors duration-200 group-hover:bg-amber-500 group-hover:text-black">
                      {idx + 1}
                    </span>
                    <span className="transition-colors duration-200 group-hover:text-amber-850">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags cloud */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-405 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-650 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:scale-105 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Map redirection button */}
          <div className="mt-auto pt-6">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.name + " " + (place.address || "")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-zinc-250 hover:border-zinc-350 text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm group font-bold text-xs"
            >
              <Landmark className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <span>{t("place.navigateGoogle")}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
