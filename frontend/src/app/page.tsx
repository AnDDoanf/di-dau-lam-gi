"use client";

import { useState, useEffect, useMemo } from "react";
import { PLACES } from "@/data/places";
import { CITIES } from "@/data/cities";
import { Place, PlaceCategory } from "@/types/place";
import { TourStop } from "@/types/tour";
import { generateTourUrlParams } from "@/lib/url-parser";
import { useVisitedPlaces } from "@/hooks/useVisitedPlaces";
import { useTourGenerator } from "@/hooks/useTourGenerator";
import { getGoogleMapsDirUrl } from "@/lib/map-utils";
import TravelMap from "@/components/map/TravelMap";
import FilterPanel from "@/components/sidebar/FilterPanel";
import TourGenerator from "@/components/sidebar/TourGenerator";
import PlaceCard from "@/components/places/PlaceCard";
import PlaceDetail from "@/components/places/PlaceDetail";
import { MapPin, Navigation, Compass, Layers, Menu, X, ArrowRight, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  // 1. Core State
  const [selectedCityId, setSelectedCityId] = useState("hanoi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[]>([]);
  const [visitedFilter, setVisitedFilter] = useState<"all" | "unvisited" | "visited">("all");
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  
  const [activeTourStops, setActiveTourStops] = useState<TourStop[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  // Load custom hooks
  const {
    visitedIds,
    isInitialized: isVisitedInitialized,
    toggleVisited,
    isVisited,
  } = useVisitedPlaces();

  const { generateTourByCount, generateTourByDays } = useTourGenerator(PLACES, visitedIds);

  // Get current city details
  const activeCity = useMemo(() => {
    return CITIES.find((c) => c.id === selectedCityId) || CITIES[0];
  }, [selectedCityId]);

  // Center coordinate state
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8542]);
  const [mapZoom, setMapZoom] = useState(14);

  // Update map position when active city changes
  useEffect(() => {
    setMapCenter([activeCity.latitude, activeCity.longitude]);
    setMapZoom(activeCity.zoom);
  }, [activeCity]);

  // Reset tour when changing cities to keep it geographically consistent
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setActiveTourStops([]);
  };

  // Filtered places selector
  const filteredPlaces = useMemo(() => {
    return PLACES.filter((place) => {
      // Filter by city
      if (place.city !== selectedCityId) return false;

      // Filter by search query (name, tags, description)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesTags = place.tags.some((t) => t.toLowerCase().includes(query));
        const matchesDesc = place.description?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesTags && !matchesDesc) return false;
      }

      // Filter by categories
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(place.category)) return false;
      }

      // Filter by visited state
      const visited = visitedIds.includes(place.id);
      if (visitedFilter === "visited" && !visited) return false;
      if (visitedFilter === "unvisited" && visited) return false;

      // Filter by price level
      if (priceFilter !== null && place.priceLevel !== priceFilter) return false;

      return true;
    });
  }, [selectedCityId, searchQuery, selectedCategories, visitedFilter, priceFilter, visitedIds]);

  // Handlers
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setIsDetailOpen(true);
  };

  const handleToggleVisited = (placeId: string) => {
    toggleVisited(placeId);
    // If marked as visited, trigger success confetti celebration
    if (!visitedIds.includes(placeId)) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#f59e0b", "#10b981", "#3b82f6"],
      });
    }

    // If marked as visited, remove it from active tour since visited places are excluded from paths
    if (!visitedIds.includes(placeId)) {
      setActiveTourStops((stops) => stops.filter((stop) => !(stop.type === "place" && stop.placeId === placeId)));
    }
  };

  const handleToggleTourStop = (placeId: string) => {
    const isAlreadyInTour = activeTourStops.some((stop) => stop.type === "place" && stop.placeId === placeId);
    if (isAlreadyInTour) {
      setActiveTourStops(activeTourStops.filter((stop) => !(stop.type === "place" && stop.placeId === placeId)));
    } else {
      setActiveTourStops([...activeTourStops, { type: "place", placeId }]);
    }
  };

  const handleGenerateByCount = (count: 3 | 5 | 7 | 10) => {
    const generatedStops = generateTourByCount(selectedCityId, count);
    if (generatedStops.length > 0) {
      setActiveTourStops(generatedStops);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#ffffff"],
      });
    }
  };

  const handleGenerateByDays = (days: 1 | 2 | 3) => {
    const { stops } = generateTourByDays(selectedCityId, days);
    if (stops.length > 0) {
      setActiveTourStops(stops);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#a855f7", "#f59e0b", "#10b981"],
      });
    }
  };

  const handleClearTour = () => {
    setActiveTourStops([]);
  };

  const handleShareTour = () => {
    // Generate share parameters
    const queryParams = generateTourUrlParams(activeTourStops, visitedIds.filter(id => 
      activeTourStops.some(stop => stop.type === "place" && stop.placeId === id)
    ));
    
    // Build share link
    const shareUrl = `${window.location.origin}/tour?${queryParams}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setVisitedFilter("all");
    setPriceFilter(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 font-sans">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-[420px] h-full bg-white border-r border-zinc-200 shrink-0 overflow-y-auto shadow-sm">
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black">
              đđ
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-750 to-zinc-600 bg-clip-text text-transparent">
                {t("brand.title")}
              </h1>
              <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                {t("brand.subtitle")}
              </span>
            </div>
          </div>

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

        <div className="p-5 flex flex-col gap-5">
          {/* City Selector */}
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-wider">
              {t("sidebar.exploreCity")}
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 border border-zinc-200 rounded-xl">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCityChange(city.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 active:scale-95 hover:scale-[1.02] ${
                    selectedCityId === city.id
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-white/40"
                  }`}
                >
                  <MapPin className={`w-4 h-4 mb-0.5 transition-transform duration-300 ${selectedCityId === city.id ? "text-amber-500 scale-110" : "text-zinc-400"}`} />
                  <span className="text-[10px] font-extrabold tracking-wide uppercase">{t(`cities.${city.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator Panel */}
          <TourGenerator
            onGenerateByCount={handleGenerateByCount}
            onGenerateByDays={handleGenerateByDays}
            onClearTour={handleClearTour}
            hasActiveTour={activeTourStops.length > 0}
            tourStopsCount={activeTourStops.length}
            onShareTour={handleShareTour}
            shareStatus={shareStatus}
          />

          {/* Search and Filters */}
          <FilterPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            visitedFilter={visitedFilter}
            setVisitedFilter={setVisitedFilter}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            onClearFilters={handleClearFilters}
          />

          {/* Place List */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                {t("sidebar.locations")} ({filteredPlaces.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">
                {t("sidebar.showingUnvisited")}
              </span>
            </div>
            
            {filteredPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-zinc-200 border-dashed text-center">
                <Compass className="w-8 h-8 text-zinc-400 mb-2 animate-spin-slow" />
                <p className="text-zinc-600 text-xs font-bold mb-1">{t("sidebar.noSpots")}</p>
                <p className="text-zinc-500 text-[10px]">{t("sidebar.noSpotsDesc")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {/* Sort unvisited first */}
                {[...filteredPlaces]
                  .sort((a, b) => {
                    const vA = visitedIds.includes(a.id) ? 1 : 0;
                    const vB = visitedIds.includes(b.id) ? 1 : 0;
                    return vA - vB;
                  })
                  .map((place) => {
                    const isV = visitedIds.includes(place.id);
                    const tourOrderIndex = activeTourStops.findIndex(
                      (stop) => stop.type === "place" && stop.placeId === place.id
                    );
                    const isInT = tourOrderIndex !== -1;
                    return (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        isVisited={isV}
                        isInTour={isInT}
                        tourOrderIndex={tourOrderIndex}
                        onSelect={handlePlaceSelect}
                        onToggleVisited={() => handleToggleVisited(place.id)}
                        onToggleTour={() => handleToggleTourStop(place.id)}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN MAP PAGE */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Floating Mobile Top bar */}
        <header className="flex md:hidden items-center justify-between p-4 bg-white border-b border-zinc-250 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-black font-extrabold text-sm shrink-0">
              đ
            </div>
            <span className="font-extrabold text-sm text-zinc-900 truncate max-w-[120px] sm:max-w-none">
              {t("brand.title")}
            </span>
          </div>
 
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick language toggle */}
            <button
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="px-2 py-1 bg-zinc-150 border border-zinc-200 rounded-lg text-[10px] font-extrabold text-zinc-700 active:scale-95 transition-all duration-200"
            >
              {language.toUpperCase()}
            </button>

            {/* Quick city pill toggler */}
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase py-1 px-2 rounded-lg outline-none text-amber-700"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`cities.${c.id}`).toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
              className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-650"
            >
              {isSidebarOpenMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Map Container - taking remaining viewport */}
        <div className="flex-1 w-full h-full relative z-10">
          <TravelMap
            places={PLACES}
            tourStops={activeTourStops}
            visitedIds={visitedIds}
            onPlaceClick={handlePlaceSelect}
            onAddStop={handleToggleTourStop}
            onToggleVisited={handleToggleVisited}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>

        {/* Mobile Slide-over Drawer containing Search / Filters / Locations list */}
        {isSidebarOpenMobile && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-white/95 backdrop-blur-md pt-16 overflow-y-auto">
            <div className="p-4 flex flex-col gap-5">
              {/* AI generator */}
              <TourGenerator
                onGenerateByCount={handleGenerateByCount}
                onGenerateByDays={handleGenerateByDays}
                onClearTour={handleClearTour}
                hasActiveTour={activeTourStops.length > 0}
                tourStopsCount={activeTourStops.length}
                onShareTour={handleShareTour}
                shareStatus={shareStatus}
              />

              {/* Filters */}
              <FilterPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                visitedFilter={visitedFilter}
                setVisitedFilter={setVisitedFilter}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                onClearFilters={handleClearFilters}
              />

              {/* Location items list */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-3 tracking-wider">
                  {t("sidebar.locations")} ({filteredPlaces.length})
                </span>
                <div className="flex flex-col gap-3">
                  {filteredPlaces.map((place) => {
                    const isV = visitedIds.includes(place.id);
                    const tourOrderIndex = activeTourStops.findIndex(
                      (stop) => stop.type === "place" && stop.placeId === place.id
                    );
                    const isInT = tourOrderIndex !== -1;
                    return (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        isVisited={isV}
                        isInTour={isInT}
                        tourOrderIndex={tourOrderIndex}
                        onSelect={(p) => {
                          handlePlaceSelect(p);
                          setIsSidebarOpenMobile(false); // Close sidebar to let them see details on map
                        }}
                        onToggleVisited={() => handleToggleVisited(place.id)}
                        onToggleTour={() => handleToggleTourStop(place.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating active tour route indicator bar (if tour is active) */}
        {activeTourStops.length > 0 && (
          <div className="absolute bottom-6 left-6 right-6 md:left-[446px] z-30 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-amber-400 flex items-center justify-between shadow-2xl animate-bounce-short">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black font-black">
                {activeTourStops.length}
              </div>
              <div>
                <span className="block text-xs font-black text-zinc-900">
                  {t("tour.activeTour")}
                </span>
                <span className="text-[10px] text-amber-700 font-bold tracking-wide">
                  {t("tour.routeOptimization")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getGoogleMapsDirUrl(activeTourStops, PLACES)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm group"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0 transition-transform duration-350 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>{t("tour.openMaps")}</span>
              </a>

              <button
                onClick={handleShareTour}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-md ${
                  shareStatus === "copied"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-650"
                    : "bg-amber-500 text-black hover:bg-amber-600 border-amber-400 shadow-sm"
                }`}
              >
                {shareStatus === "copied" ? t("generator.copied") : t("tour.shareLink")}
              </button>
              
              <button
                onClick={handleClearTour}
                className="hidden sm:block text-[11px] text-zinc-550 hover:text-red-650 transition-all duration-200 active:scale-95 hover:scale-105 font-bold"
              >
                {t("generator.discard")}
              </button>
            </div>
          </div>
        )}

        {/* Detailed drawer overlay */}
        <PlaceDetail
          place={selectedPlace}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          isVisited={selectedPlace ? isVisited(selectedPlace.id) : false}
          isInTour={
            selectedPlace
              ? activeTourStops.some((stop) => stop.type === "place" && stop.placeId === selectedPlace.id)
              : false
          }
          onToggleVisited={() => selectedPlace && handleToggleVisited(selectedPlace.id)}
          onToggleTour={() => selectedPlace && handleToggleTourStop(selectedPlace.id)}
        />
      </main>
    </div>
  );
}
