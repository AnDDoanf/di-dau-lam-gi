"use client";

import { Place, PlaceCategory } from "@/types/place";
import { TourStop } from "@/types/tour";
import { optimizeRoute } from "@/lib/route-generator";

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useTourGenerator(allPlaces: Place[], visitedPlaceIds: string[]) {
  
  /**
   * Mode A: Generate tour by number of places.
   * Compiles the list of stops and optimizes the route.
   */
  const generateTourByCount = (
    cityId: string,
    count: 3 | 5 | 7 | 10
  ): TourStop[] => {
    // 1. Filter places by city and check unvisited status
    const cityPlaces = allPlaces.filter(
      (p) => p.city === cityId && !visitedPlaceIds.includes(p.id)
    );

      // 2. Define category counts based on spec table
    // Composition: Main Meal | Street Food | Drink/Coffee | Dessert | Attraction
    const rule: Record<PlaceCategory, number> = {
      main_meal: 0,
      street_food: 0,
      coffee: 0, // we will map coffee and drink into coffee/drink
      drink: 0,
      fast_food: 0,
      dessert: 0,
      bar: 0,
      attraction: 0,
    };

    if (count === 3) {
      rule.main_meal = 1;
      rule.street_food = 1;
      rule.coffee = 1; // 1 drink/coffee
    } else if (count === 5) {
      rule.main_meal = 1;
      rule.street_food = 2;
      rule.coffee = 1;
      rule.dessert = 1;
    } else if (count === 7) {
      rule.main_meal = 2;
      rule.street_food = 2;
      rule.coffee = 1;
      rule.dessert = 1;
      rule.attraction = 1;
    } else if (count === 10) {
      rule.main_meal = 2;
      rule.street_food = 3;
      rule.coffee = 2; // 2 drink/coffee
      rule.dessert = 1;
      rule.attraction = 2;
    }

    // 3. Pool items by category (shuffled for dynamic experience)
    const categoryPool: Record<string, Place[]> = {};
    const categoriesToFetch: PlaceCategory[] = [
      "main_meal",
      "street_food",
      "coffee",
      "drink",
      "dessert",
      "bar",
      "attraction",
      "fast_food",
    ];

    for (const cat of categoriesToFetch) {
      categoryPool[cat] = shuffleArray(cityPlaces.filter((p) => p.category === cat));
    }

    const selectedPlaces: Place[] = [];

    // Helper to extract a place from specific categories
    const pullPlace = (categories: PlaceCategory[]): Place | null => {
      for (const cat of categories) {
        if (categoryPool[cat] && categoryPool[cat].length > 0) {
          return categoryPool[cat].shift()!;
        }
      }
      return null;
    };

    // Grab according to rules
    // Main meals
    for (let i = 0; i < rule.main_meal; i++) {
      const p = pullPlace(["main_meal", "fast_food"]);
      if (p) selectedPlaces.push(p);
    }
    // Street Food
    for (let i = 0; i < rule.street_food; i++) {
      const p = pullPlace(["street_food", "fast_food"]);
      if (p) selectedPlaces.push(p);
    }
    // Coffee / Drink
    for (let i = 0; i < rule.coffee; i++) {
      const p = pullPlace(["coffee", "drink", "bar"]);
      if (p) selectedPlaces.push(p);
    }
    // Dessert
    for (let i = 0; i < rule.dessert; i++) {
      const p = pullPlace(["dessert"]);
      if (p) selectedPlaces.push(p);
    }
    // Attraction
    for (let i = 0; i < rule.attraction; i++) {
      const p = pullPlace(["attraction"]);
      if (p) selectedPlaces.push(p);
    }

    // Fallback: If we didn't get enough places due to inventory, pull from remaining unvisited city places
    const remainingUnvisited = shuffleArray(
      cityPlaces.filter((p) => !selectedPlaces.some((sp) => sp.id === p.id))
    );
    while (selectedPlaces.length < count && remainingUnvisited.length > 0) {
      selectedPlaces.push(remainingUnvisited.shift()!);
    }

    // 4. Optimize Route order using Nearest Neighbor
    const optimized = optimizeRoute(selectedPlaces, 0);

    // 5. Convert to TourStop format
    return optimized.map((p) => ({
      type: "place",
      placeId: p.id,
    }));
  };

  /**
   * Mode B: Generate tour by days.
   * Daily slot schedule:
   * Morning: Coffee/Drink
   * Lunch: Main Meal
   * Afternoon: Street Food
   * Evening: Main Meal (Day 1) or Attraction (Day 2/3)
   * Night: Dessert/Drink/Bar
   */
  const generateTourByDays = (
    cityId: string,
    days: 1 | 2 | 3
  ): { stops: TourStop[]; daySchedules: { day: number; stops: TourStop[] }[] } => {
    // 1. Get city places
    const cityPlaces = allPlaces.filter(
      (p) => p.city === cityId && !visitedPlaceIds.includes(p.id)
    );

    // 2. Pool items
    const categoryPool: Record<string, Place[]> = {};
    const categoriesToFetch: PlaceCategory[] = [
      "main_meal",
      "street_food",
      "coffee",
      "drink",
      "dessert",
      "bar",
      "attraction",
      "fast_food",
    ];

    for (const cat of categoriesToFetch) {
      categoryPool[cat] = shuffleArray(cityPlaces.filter((p) => p.category === cat));
    }

    const pullPlace = (categories: PlaceCategory[]): Place | null => {
      for (const cat of categories) {
        if (categoryPool[cat] && categoryPool[cat].length > 0) {
          return categoryPool[cat].shift()!;
        }
      }
      return null;
    };

    const daySchedules: { day: number; stops: TourStop[] }[] = [];
    const allStops: TourStop[] = [];

    // Define schedules per day
    for (let d = 1; d <= days; d++) {
      const dayPlaces: Place[] = [];

      // Slot 1: Morning (Coffee / Drink)
      const morning = pullPlace(["coffee", "drink"]);
      if (morning) dayPlaces.push(morning);

      // Slot 2: Lunch (Main Meal)
      const lunch = pullPlace(["main_meal", "fast_food"]);
      if (lunch) dayPlaces.push(lunch);

      // Slot 3: Afternoon (Street Food)
      const afternoon = pullPlace(["street_food", "fast_food"]);
      if (afternoon) dayPlaces.push(afternoon);

      // Slot 4: Evening (Main Meal on Day 1, Attraction on Day 2 & 3)
      const eveningCategories: PlaceCategory[] =
        d === 1 ? ["main_meal", "street_food"] : ["attraction", "main_meal"];
      const evening = pullPlace(eveningCategories);
      if (evening) dayPlaces.push(evening);

      // Slot 5: Night (Dessert / Drink / Bar)
      const night = pullPlace(["dessert", "bar", "drink"]);
      if (night) dayPlaces.push(night);

      // Fallback: If we couldn't fill 5 places for this day, pull from general leftover pool
      const selectedIds = dayPlaces.map((dp) => dp.id);
      const remainingUnvisited = shuffleArray(
        cityPlaces.filter(
          (p) =>
            !selectedIds.includes(p.id) &&
            !allStops.some((as) => as.type === "place" && as.placeId === p.id)
        )
      );

      while (dayPlaces.length < 5 && remainingUnvisited.length > 0) {
        dayPlaces.push(remainingUnvisited.shift()!);
      }

      // Optimize each day's route individually for geographical sense
      const optimizedDayPlaces = optimizeRoute(dayPlaces, 0);

      const dayStops: TourStop[] = optimizedDayPlaces.map((p) => ({
        type: "place",
        placeId: p.id,
      }));

      daySchedules.push({
        day: d,
        stops: dayStops,
      });

      allStops.push(...dayStops);
    }

    return {
      stops: allStops,
      daySchedules,
    };
  };

  return {
    generateTourByCount,
    generateTourByDays,
  };
}
