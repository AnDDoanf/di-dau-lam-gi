"use client";

import React, { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePlaces } from "@/context/PlacesContext";
import { CATEGORIES } from "@/data/categories";
import { useVisitedPlaces } from "@/hooks/useVisitedPlaces";
import TravelMap from "@/components/map/TravelMap";
import { useLanguage } from "@/context/LanguageContext";

import { ArrowLeft, Check, MapPin, Clock, Utensils, Share2, Navigation } from "lucide-react";
import confetti from "canvas-confetti";

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

export default function PlaceDetailClient({ params }: PlacePageProps) {
  const { t } = useLanguage();
  const { places } = usePlaces();
  // Unwrap Next.js dynamic route params
  const { slug } = use(params);
  const router = useRouter();
  const { visitedIds, toggleVisited } = useVisitedPlaces();
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  // Fetch target place
  const place = useMemo(() => {
    return places.find((p) => p.slug === slug);
  }, [slug, places]);

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-6 text-center text-zinc-900">
        <h2 className="text-xl font-bold mb-2">{t("place.notFound")}</h2>
        <p className="text-zinc-550 text-sm mb-6">{t("place.notFoundDesc")}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
        >
          {t("place.backDashboard")}
        </button>
      </div>
    );
  }

  const cat = CATEGORIES[place.category];
  const isV = visitedIds.includes(place.id);

  const handleToggleVisited = () => {
    toggleVisited(place.id);
    if (!isV) {
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#f59e0b", "#10b981"],
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Header NavBar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-850 transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm group text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span>{t("tour.dashboard")}</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-350 text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareStatus === "copied" ? t("generator.copied") : t("tour.shareLink")}</span>
          </button>
          
          <button
            onClick={handleToggleVisited}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-sm ${
              isV
                ? "bg-zinc-100 border-zinc-200 text-zinc-655 hover:bg-zinc-200"
                : "bg-emerald-500/10 border-emerald-500/35 text-emerald-700 hover:bg-emerald-500/20"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isV ? t("place.visitedBadge") : t("tour.markVisited")}</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: General Info Card */}
        <section className="flex flex-col gap-6">
          <div className="relative h-80 rounded-2xl overflow-hidden bg-zinc-100 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              {cat && (
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border tracking-wide mb-3 ${cat.colorClass}`}>
                  {t(`category.${cat.id}`)}
                </span>
              )}
              <h1 className="text-3xl font-black text-white leading-tight drop-shadow-lg">
                {place.name}
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-405 mb-3">{t("place.about")}</h2>
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">{place.description}</p>
          </div>

          {/* Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex gap-3.5">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-zinc-500">{t("place.address")}</span>
                <span className="text-xs text-zinc-800 block mt-1">{place.address}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex gap-3.5">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-zinc-500">{t("place.hours")}</span>
                <span className="text-xs text-zinc-800 block mt-1">{place.openingHours || "Unspecified"}</span>
              </div>
            </div>
          </div>

          {/* Specialties items */}
          {place.recommendedItems && place.recommendedItems.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-405 mb-4 flex items-center gap-1.5">
                <Utensils className="w-4.5 h-4.5 text-amber-500" />
                <span>{t("place.recommendedSpecialties")}</span>
              </h2>
              <div className="flex flex-col gap-2.5">
                {place.recommendedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-xs font-bold transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100/40 hover:translate-x-1 group"
                  >
                    <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black transition-colors duration-200 group-hover:bg-amber-500 group-hover:text-black">
                      {index + 1}
                    </span>
                    <span className="transition-colors duration-200 group-hover:text-amber-850">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Interactive Map focusing on the coordinates */}
        <section className="flex flex-col gap-4 h-[400px] md:h-auto">
          <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden shadow-xl">
            <TravelMap
              places={[place]}
              tourStops={[{ type: "place", placeId: place.id }]}
              visitedIds={visitedIds}
              onPlaceClick={() => {}}
              onAddStop={() => {}}
              onToggleVisited={handleToggleVisited}
              center={[place.latitude, place.longitude]}
              zoom={15}
            />
          </div>
          
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              place.name + " " + (place.address || "")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-350 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm group font-bold text-xs"
          >
            <Navigation className="w-4.5 h-4.5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span>{t("place.navigateGoogle")}</span>
          </a>
        </section>
      </main>
    </div>
  );
}
