"use client";

import dynamic from "next/dynamic";
import { Place } from "@/types/place";
import { TourStop } from "@/types/tour";

// Dynamically import LeafletMap with SSR disabled to prevent Server-Side 'window is not defined' errors
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-600">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        <span>Initializing Map System...</span>
      </div>
    </div>
  ),
});

interface TravelMapProps {
  places: Place[];
  tourStops: TourStop[];
  visitedIds: string[];
  onPlaceClick: (place: Place) => void;
  onAddStop: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  center: [number, number];
  zoom: number;
}

export default function TravelMap({
  places,
  tourStops,
  visitedIds,
  onPlaceClick,
  onAddStop,
  onToggleVisited,
  center,
  zoom,
}: TravelMapProps) {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl border border-zinc-200 shadow-xl bg-zinc-50">
      {/*
        We use our LeafletMap as the robust local engine.
        In Phase 2, we can swap in Google Maps or hook up an API key loader.
        This fits the requirements of static hosting, offline support, and API key autonomy.
      */}
      <LeafletMap
        places={places}
        tourStops={tourStops}
        visitedIds={visitedIds}
        onPlaceClick={onPlaceClick}
        onAddStop={onAddStop}
        onToggleVisited={onToggleVisited}
        center={center}
        zoom={zoom}
      />
    </div>
  );
}
