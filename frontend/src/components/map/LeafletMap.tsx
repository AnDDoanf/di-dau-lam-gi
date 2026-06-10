"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/types/place";
import { TourStop } from "@/types/tour";
import { CATEGORIES } from "@/data/categories";
import { Check, Plus, Navigation } from "lucide-react"; 

interface LeafletMapProps {
  places: Place[];
  tourStops: TourStop[];
  visitedIds: string[];
  onPlaceClick: (place: Place) => void;
  onAddStop: (placeId: string) => void;
  onToggleVisited: (placeId: string) => void;
  center: [number, number];
  zoom: number;
  searchQuery?: string;
}

// Map controller to handle bounds changes dynamically
function ChangeView({ bounds, center }: { bounds: L.LatLngBounds | null; center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      map.setView(center, 14);
    }
  }, [bounds, center, map]);

  return null;
}

export default function LeafletMap({
  places,
  tourStops,
  visitedIds,
  onPlaceClick,
  onAddStop,
  onToggleVisited,
  center,
  zoom,
  searchQuery,
}: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Navigation className="w-8 h-8 text-amber-500 animate-spin" />
          <span>Loading Interactive Map...</span>
        </div>
      </div>
    );
  }

  // Find coordinates for polylines connecting the tour stops (exclude visited stops from polyline)
  const tourCoords: [number, number][] = [];
  tourStops.forEach((stop) => {
    if (stop.type === "place") {
      const place = places.find((p) => p.id === stop.placeId);
      if (place && !visitedIds.includes(place.id)) {
        tourCoords.push([place.latitude, place.longitude]);
      }
    } else if (stop.type === "custom") {
      tourCoords.push([stop.latitude, stop.longitude]);
    }
  });

  // Calculate bounding box for active tour stops
  let mapBounds: L.LatLngBounds | null = null;
  if (tourCoords.length > 0) {
    const leafletCoords = tourCoords.map((c) => L.latLng(c[0], c[1]));
    mapBounds = L.latLngBounds(leafletCoords);
  }

  // Create custom marker icons
  const createMarkerIcon = (
    place: Place,
    tourOrderIndex: number,
    isMatch: boolean,
    hasActiveSearch: boolean
  ) => {
    const isVisited = visitedIds.includes(place.id);
    const cat = CATEGORIES[place.category];
    const catColor = cat ? cat.markerColor : "#ffffff";

    let opacityClass = "";
    let highlightClass = "";
    let pingHtml = "";

    if (hasActiveSearch) {
      if (isMatch) {
        highlightClass = "border-amber-500 scale-125 z-[1000] ring-4 ring-amber-500/20";
        pingHtml = `<div class="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-60"></div>`;
      } else {
        opacityClass = "opacity-30 grayscale scale-90";
      }
    }

    if (isVisited) {
      return L.divIcon({
        className: `custom-visited-marker ${opacityClass} ${highlightClass}`,
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-800 text-zinc-400 shadow-lg transition duration-300 transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
            ${pingHtml}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    }

    if (tourOrderIndex !== -1) {
      // In tour list, render with the active number order
      return L.divIcon({
        className: `custom-tour-marker ${opacityClass} ${highlightClass}`,
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-500 text-black font-extrabold shadow-xl transition duration-300 transform">
            <span class="text-sm">${tourOrderIndex + 1}</span>
            <div class="absolute -bottom-1 w-2 h-2 bg-amber-500 rotate-45 border-r border-b border-amber-400"></div>
            <div class="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-25 -z-10"></div>
            ${pingHtml}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
    }

    // Standard unvisited place
    return L.divIcon({
      className: `custom-place-marker ${opacityClass} ${highlightClass}`,
      html: `
        <div class="group relative flex items-center justify-center w-7 h-7 rounded-full border-2 bg-white shadow-md transition duration-300 transform" style="border-color: ${catColor}">
          <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${catColor}"></div>
          <div class="absolute -bottom-1 w-1.5 h-1.5 bg-white rotate-45" style="border-right: 2px solid ${catColor}; border-bottom: 2px solid ${catColor}"></div>
          ${pingHtml}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  };

  const query = searchQuery?.toLowerCase().trim() || "";
  const hasActiveSearch = query !== "";

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: "#f4f4f5" }}
      >
        {/* Sleek Light-themed Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Route Polyline (Draw only for active, unvisited stops in tour) */}
        {tourCoords.length > 1 && (
          <Polyline
            positions={tourCoords}
            color="#f59e0b" // Amber accent
            weight={4}
            opacity={0.8}
            dashArray="1, 8" // Dotted path effect
            className="animate-pulse"
          />
        )}

        {/* Render markers */}
        {places.map((place) => {
          const tourOrderIndex = tourStops.findIndex(
            (stop) => stop.type === "place" && stop.placeId === place.id
          );
          const isVisited = visitedIds.includes(place.id);
          const cat = CATEGORIES[place.category];

          const isMatch =
            !hasActiveSearch ||
            place.name.toLowerCase().includes(query) ||
            place.tags.some((t) => t.toLowerCase().includes(query)) ||
            !!(place.description && place.description.toLowerCase().includes(query));

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={createMarkerIcon(place, tourOrderIndex, isMatch, hasActiveSearch)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 bg-white text-zinc-900 rounded-lg max-w-[240px] border border-zinc-200 shadow-xl">
                  <h3 className="font-bold text-sm text-zinc-900 mb-1 leading-tight">{place.name}</h3>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border mb-2 ${
                      cat ? cat.colorClass : "bg-zinc-100 border-zinc-200 text-zinc-650"
                    }`}
                  >
                    {cat ? cat.label : place.category}
                  </span>
                  
                  <p className="text-xs text-zinc-600 mb-3 line-clamp-2">{place.description}</p>
                  
                  {place.recommendedItems && place.recommendedItems.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Recommended:</span>
                      <ul className="text-xs text-amber-700 font-bold pl-1 list-inside">
                        {place.recommendedItems.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="truncate">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100">
                    <button
                      onClick={() => onPlaceClick(place)}
                      className="w-full text-center py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 transition"
                    >
                      View Details
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAddStop(place.id)}
                        disabled={tourOrderIndex !== -1}
                        className={`flex items-center justify-center gap-1 py-1 rounded text-xs font-bold transition ${
                          tourOrderIndex !== -1
                            ? "bg-amber-500/5 text-amber-600/40 cursor-not-allowed border border-amber-500/10"
                            : "bg-amber-500 hover:bg-amber-600 text-black font-extrabold"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => onToggleVisited(place.id)}
                        className={`flex items-center justify-center gap-1 py-1 rounded text-xs font-bold border transition ${
                          isVisited
                            ? "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-150"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isVisited ? "Visited" : "Visit"}</span>
                      </button>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        place.name + " " + (place.address || "")
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-1 rounded border border-zinc-200 text-[10px] text-zinc-550 hover:text-zinc-800 hover:border-zinc-350 transition font-bold"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Change view controller */}
        <ChangeView bounds={mapBounds} center={center} />
      </MapContainer>
    </div>
  );
}
