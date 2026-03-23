export interface CityCoord {
  name: string;
  latitude: number;
  longitude: number;
}

export const MAHARASHTRA_CITIES: CityCoord[] = [
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { name: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
];

export function getNearestCity(lat: number, lng: number): string {
  let nearest = MAHARASHTRA_CITIES[0];
  let minDist = Number.POSITIVE_INFINITY;

  for (const city of MAHARASHTRA_CITIES) {
    const dLat = (city.latitude - lat) * (Math.PI / 180);
    const dLng = (city.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(city.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest.name;
}
