export type TourStop =
  | {
      type: "place";
      placeId: string;
    }
  | {
      type: "custom";
      latitude: number;
      longitude: number;
      label?: string;
      category?: string;
    };

export interface Tour {
  stops: TourStop[];
  visitedPlaceIds: string[];
}
