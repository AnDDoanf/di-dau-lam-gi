import { Place } from "@/types/place";
import { Tour, TourStop } from "@/types/tour";

/**
 * Parses a Tour object from URL search parameters.
 */
export function parseTourFromUrl(searchParams: URLSearchParams, allPlaces: Place[]): Tour {
  const stopsParam = searchParams.get("stops") || "";
  const visitedParam = searchParams.get("visited") || "";

  const stops: TourStop[] = [];
  const visitedPlaceIds: string[] = [];

  // Parse stops: "id:bun-cha|custom:21.0285,105.8542"
  if (stopsParam) {
    const stopTokens = stopsParam.split("|");
    for (const token of stopTokens) {
      if (token.startsWith("id:")) {
        const placeId = token.substring(3).trim();
        // Validate if the place exists
        const exists = allPlaces.some((p) => p.id === placeId);
        if (exists) {
          stops.push({
            type: "place",
            placeId,
          });
        }
      } else if (token.startsWith("custom:")) {
        const coordsStr = token.substring(7).trim();
        const [latStr, lngStr] = coordsStr.split(",");
        const latitude = parseFloat(latStr);
        const longitude = parseFloat(lngStr);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          stops.push({
            type: "custom",
            latitude,
            longitude,
            label: `Custom Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          });
        }
      }
    }
  }

  // Parse visited: "egg-coffee|pho-thin" or "egg-coffee,pho-thin"
  if (visitedParam) {
    const separator = visitedParam.includes("|") ? "|" : ",";
    const visitedTokens = visitedParam.split(separator);
    for (const token of visitedTokens) {
      const trimmed = token.trim();
      if (trimmed) {
        visitedPlaceIds.push(trimmed);
      }
    }
  }

  return {
    stops,
    visitedPlaceIds,
  };
}

/**
 * Encodes a Tour's components into standard query parameters.
 */
export function generateTourUrlParams(stops: TourStop[], visitedPlaceIds: string[]): string {
  const tokens: string[] = [];

  for (const stop of stops) {
    if (stop.type === "place") {
      tokens.push(`id:${stop.placeId}`);
    } else if (stop.type === "custom") {
      tokens.push(`custom:${stop.latitude.toFixed(6)},${stop.longitude.toFixed(6)}`);
    }
  }

  const params = new URLSearchParams();
  if (tokens.length > 0) {
    params.set("stops", tokens.join("|"));
  }
  if (visitedPlaceIds.length > 0) {
    params.set("visited", visitedPlaceIds.join("|"));
  }

  return params.toString();
}
