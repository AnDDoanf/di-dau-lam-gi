export interface CityInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

export const CITIES: CityInfo[] = [
  {
    id: "hanoi",
    name: "Hanoi",
    latitude: 21.0285,
    longitude: 105.8542,
    zoom: 14,
  },
  {
    id: "hcmc",
    name: "Ho Chi Minh City",
    latitude: 10.7769,
    longitude: 106.7009,
    zoom: 14,
  },
  {
    id: "danang",
    name: "Da Nang",
    latitude: 16.0544,
    longitude: 108.2022,
    zoom: 14,
  },
];
