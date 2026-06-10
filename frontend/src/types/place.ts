export type PlaceCategory =
  | "main_meal"
  | "street_food"
  | "fast_food"
  | "drink"
  | "dessert"
  | "coffee"
  | "bar"
  | "attraction";

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  tags: string[];
  openingHours?: string;
  recommendedItems?: string[];
  priceLevel?: 1 | 2 | 3 | 4;
  city: string;
}

export type VisitStatus = "visited" | "unvisited";
