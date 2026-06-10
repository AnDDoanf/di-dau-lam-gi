import { Place } from "@/types/place";

// Calculate Great-Circle Distance using Haversine formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Optimizes a list of places using the Nearest Neighbor algorithm.
 * Starts at the first place (or a specified starting index/place)
 * and visits the nearest unvisited place.
 */
export function optimizeRoute(places: Place[], startIndex: number = 0): Place[] {
  if (places.length <= 1) return [...places];

  const unvisited = [...places];
  const optimized: Place[] = [];

  // Start with the selected starting node
  let current = unvisited.splice(startIndex, 1)[0];
  optimized.push(current);

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = getDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    // Set nearest as current
    current = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(current);
  }

  return optimized;
}
