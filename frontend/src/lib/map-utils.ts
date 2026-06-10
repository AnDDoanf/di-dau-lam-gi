import { Place } from "@/types/place";
import { TourStop } from "@/types/tour";

/**
 * Computes the geographic center of a set of coordinates.
 */
export function getCenterOfPoints(
  points: { latitude: number; longitude: number }[]
): { latitude: number; longitude: number } | null {
  if (points.length === 0) return null;

  let sumLat = 0;
  let sumLng = 0;

  for (const p of points) {
    sumLat += p.latitude;
    sumLng += p.longitude;
  }

  return {
    latitude: sumLat / points.length,
    longitude: sumLng / points.length,
  };
}

/**
 * Bounding box for mapping viewports
 */
export interface BoundingBox {
  southWest: { latitude: number; longitude: number };
  northEast: { latitude: number; longitude: number };
}

export function getBoundingBox(
  points: { latitude: number; longitude: number }[]
): BoundingBox | null {
  if (points.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const p of points) {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  }

  // Padding
  const padLat = (maxLat - minLat) * 0.1 || 0.005;
  const padLng = (maxLng - minLng) * 0.1 || 0.005;

  return {
    southWest: { latitude: minLat - padLat, longitude: minLng - padLng },
    northEast: { latitude: maxLat + padLat, longitude: maxLng + padLng },
  };
}

/**
 * Generates a Google Maps directions URL for the entire tour route.
 */
export function getGoogleMapsDirUrl(stops: TourStop[], places: Place[]): string {
  // Resolve stops to named query locations in order
  const queries: string[] = [];
  
  for (const stop of stops) {
    if (stop.type === "place") {
      const place = places.find((p) => p.id === stop.placeId);
      if (place) {
        // Use the name + address to lookup the business listing entity
        queries.push(`${place.name}, ${place.address || ""}`);
      }
    } else if (stop.type === "custom") {
      queries.push(`${stop.latitude},${stop.longitude}`);
    }
  }

  if (queries.length === 0) return "";

  if (queries.length === 1) {
    // Single location search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queries[0])}`;
  }

  // Multi-stop directions
  const origin = queries[0];
  const destination = queries[queries.length - 1];
  
  if (queries.length === 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=walking`;
  }

  const waypoints = queries
    .slice(1, -1)
    .join("|");

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(
    waypoints
  )}&travelmode=walking`;
}
