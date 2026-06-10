"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PLACES } from "@/data/places";
import { Place, PlaceCategory } from "@/types/place";
import { TourStop } from "@/types/tour";
import { parseTourFromUrl, generateTourUrlParams } from "@/lib/url-parser";
import { useVisitedPlaces } from "@/hooks/useVisitedPlaces";
import { CATEGORIES } from "@/data/categories";
import { getGoogleMapsDirUrl } from "@/lib/map-utils";
import TravelMap from "@/components/map/TravelMap";
import PlaceCard from "@/components/places/PlaceCard";
import PlaceDetail from "@/components/places/PlaceDetail";
import { ArrowLeft, Share2, Compass, CheckCircle2, ChevronRight, MapPin, AlertTriangle, Sparkles, Navigation } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

function SharedTourContent() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Visited places system (localStorage sync)
  const { visitedIds, toggleVisited, isVisited } = useVisitedPlaces();

  // 2. Parse initial tour from URL params
  const initialTour = useMemo(() => {
    return parseTourFromUrl(searchParams, PLACES);
  }, [searchParams]);

  // Keep a local copy of tour stops so user can add/remove or manipulate
  const [tourStops, setTourStops] = useState<TourStop[]>([]);
  // Keep local visited IDs specifically tracking the items parsed from the URL
  const [tourVisitedPlaceIds, setTourVisitedPlaceIds] = useState<string[]>([]);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  // Sync state from parsed URL
  useEffect(() => {
    Promise.resolve().then(() => {
      setTourStops(initialTour.stops);
      setTourVisitedPlaceIds(initialTour.visitedPlaceIds);
    });
  }, [initialTour]);

  // Resolve stops to actual Place objects (ignore custom pins for simple listing, or map them as generic)
  const resolvedPlaces = useMemo(() => {
    return tourStops
      .map((stop) => {
        if (stop.type === "place") {
          return PLACES.find((p) => p.id === stop.placeId);
        }
        // Map custom pins to temporary Place items for consistent listing
        return {
          id: `custom-${stop.latitude}-${stop.longitude}`,
          slug: "",
          name: stop.label || "Custom Marker",
          category: (stop.category || "attraction") as PlaceCategory,
          latitude: stop.latitude,
          longitude: stop.longitude,
          address: `Coordinates: ${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`,
          tags: ["Custom"],
          city: "unknown",
        } as Place;
      })
      .filter((p): p is Place => !!p);
  }, [tourStops]);

  // Calculate active coordinates to center map
  const mapCenter = useMemo((): [number, number] => {
    if (resolvedPlaces.length > 0) {
      return [resolvedPlaces[0].latitude, resolvedPlaces[0].longitude];
    }
    return [21.0285, 105.8542]; // Default to Hanoi
  }, [resolvedPlaces]);

  // Track completion milestone of the loaded tour
  const isTourCompleted = useMemo(() => {
    if (resolvedPlaces.length === 0) return false;
    // Every place in the tour must be in the visitedIds (either global or URL-level visited)
    return resolvedPlaces.every((p) => visitedIds.includes(p.id) || tourVisitedPlaceIds.includes(p.id));
  }, [resolvedPlaces, visitedIds, tourVisitedPlaceIds]);

  // Fire confetti once when tour completes
  const [hasCelebrated, setHasCelebrated] = useState(false);
  useEffect(() => {
    if (isTourCompleted && resolvedPlaces.length > 0 && !hasCelebrated) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#f59e0b", "#10b981", "#ffffff"],
      });
      Promise.resolve().then(() => setHasCelebrated(true));
    }
  }, [isTourCompleted, resolvedPlaces, hasCelebrated]);

  // Toggle visit locally and globally
  const handleToggleVisited = (placeId: string) => {
    // Toggle in global local storage
    toggleVisited(placeId);

    // Toggle in URL-level tracking
    if (tourVisitedPlaceIds.includes(placeId)) {
      setTourVisitedPlaceIds(tourVisitedPlaceIds.filter((id) => id !== placeId));
    } else {
      setTourVisitedPlaceIds([...tourVisitedPlaceIds, placeId]);
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#f59e0b", "#3b82f6"],
      });
    }
  };

  const handleShareCurrentState = () => {
    const combinedVisited = Array.from(new Set([...tourVisitedPlaceIds, ...visitedIds.filter(id => 
      tourStops.some(stop => stop.type === "place" && stop.placeId === id)
    )]));

    const params = generateTourUrlParams(tourStops, combinedVisited);
    const shareUrl = `${window.location.origin}/tour?${params}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    });
  };

  if (tourStops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-150 mb-2">{t("tour.noStopsLoaded")}</h2>
        <p className="text-zinc-500 text-sm max-w-sm mb-6">
          {t("tour.noStopsLoadedDesc")}
        </p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("tour.returnHome")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 font-sans">
      
      {/* Sidebar - Shared tour stop listings */}
      <aside className="w-full md:w-[420px] h-1/2 md:h-full bg-white border-b md:border-b-0 md:border-r border-zinc-200 shrink-0 flex flex-col z-20 shadow-sm">
        
        {/* Header navigation bar */}
        <div className="p-4 border-b border-zinc-200 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-100 text-zinc-550 hover:text-zinc-800 transition-all duration-200 active:scale-95 hover:scale-[1.03] group text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span>{t("tour.dashboard")}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => setLanguage("vi")}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md transition-all duration-200 ${
                  language === "vi"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md transition-all duration-200 ${
                  language === "en"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <button
            onClick={handleShareCurrentState}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-md ${
              shareStatus === "copied"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-650"
                : "bg-amber-500 text-black hover:bg-amber-600 border-amber-400 shadow-sm"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareStatus === "copied" ? t("generator.copied") : t("tour.reshare")}</span>
          </button>
        </div>

        {/* Tour overview header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
          <h1 className="text-xl font-black text-zinc-900 leading-tight">
            {t("tour.sharedTour")}
          </h1>
          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
            {t("tour.optimizedRoutePlaces", { count: resolvedPlaces.length })}
          </span>

          <div className="mt-3.5">
            <a
              href={getGoogleMapsDirUrl(tourStops, PLACES)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md group"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0 transition-transform duration-350 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>{t("tour.openRouteMaps")}</span>
            </a>
          </div>

          {/* Tour milestone celebrate message */}
          {isTourCompleted && (
            <div className="mt-4 p-3 rounded-lg border border-emerald-500/25 bg-emerald-50/70 flex items-center gap-2.5 text-emerald-700 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="text-[11px] leading-snug">
                <span className="block font-bold">{t("tour.completed")}</span>
                <span className="text-emerald-600/90">{t("tour.completedDesc")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stops sequence scroll container */}
        <div className="flex-1 overflow-y-auto p-5">
          <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-4">
            {t("tour.routeSchedule")}
          </span>

          <div className="relative border-l border-zinc-200 ml-4 pl-6 space-y-6">
            {resolvedPlaces.map((place, index) => {
              const isV = visitedIds.includes(place.id) || tourVisitedPlaceIds.includes(place.id);
              const cat = CATEGORIES[place.category];

              return (
                <div key={place.id} className="relative group">
                  {/* Timeline numeric circle indicator */}
                  <span className={`absolute -left-10 top-0.5 flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-black transition-all duration-300 group-hover:scale-110 group-hover:border-amber-400 ${
                    isV
                      ? "border-zinc-200 bg-zinc-150 text-zinc-500"
                      : "border-amber-400 bg-amber-500 text-black shadow-md"
                  }`}>
                    {index + 1}
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <div className="cursor-pointer transition-transform duration-300 group-hover:translate-x-1 flex-1 min-w-0" onClick={() => setSelectedPlace(place)}>
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:text-amber-600 transition-colors duration-200 leading-snug line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="text-[10px] text-zinc-550 mt-0.5 truncate">{place.address}</p>
                      
                      {cat && (
                        <span className={`inline-block mt-2 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-transform duration-300 group-hover:scale-105 ${cat.colorClass}`}>
                          {t(`category.${place.category}`)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleVisited(place.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
                        isV
                          ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                          : "bg-emerald-500/10 border-emerald-500/35 text-emerald-750 hover:bg-emerald-500/25"
                      }`}
                    >
                      {isV ? t("tour.done") : t("tour.markVisited")}
                    </button>
                  </div>

                  {/* Connecting Arrow inside sequence */}
                  {index < resolvedPlaces.length - 1 && (
                    <div className="absolute left-[-10px] bottom-[-24px] pointer-events-none text-zinc-200">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Map Column */}
      <main className="flex-1 h-1/2 md:h-full relative z-10">
        <TravelMap
          places={PLACES}
          tourStops={tourStops}
          visitedIds={visitedIds}
          onPlaceClick={(p) => {
            setSelectedPlace(p);
            setIsDetailOpen(true);
          }}
          onAddStop={() => {}} // Disabled modification inside shared static tour
          onToggleVisited={handleToggleVisited}
          center={mapCenter}
          zoom={14}
        />

        {/* Floating completion card */}
        {isTourCompleted && (
          <div className="absolute top-6 right-6 z-30 p-4 rounded-xl bg-white border border-emerald-500/30 shadow-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-bounce" />
            <div>
              <span className="block font-black text-xs text-zinc-900">{t("tour.allVisited")}</span>
              <span className="text-[10px] text-emerald-650 font-bold">{t("tour.experienceCompleted")}</span>
            </div>
          </div>
        )}

        {/* Info drawer panel */}
        <PlaceDetail
          place={selectedPlace}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          isVisited={selectedPlace ? (visitedIds.includes(selectedPlace.id) || tourVisitedPlaceIds.includes(selectedPlace.id)) : false}
          isInTour={true}
          onToggleVisited={() => selectedPlace && handleToggleVisited(selectedPlace.id)}
          onToggleTour={() => {}} // Disabled
        />
      </main>
    </div>
  );
}

export default function SharedTourPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-zinc-50 flex flex-col items-center justify-center gap-3 text-zinc-600">
          <Compass className="w-10 h-10 text-amber-500 animate-spin" />
          <span className="text-xs font-bold tracking-wider">{t("tour.unpacking")}</span>
        </div>
      }
    >
      <SharedTourContent />
    </Suspense>
  );
}
