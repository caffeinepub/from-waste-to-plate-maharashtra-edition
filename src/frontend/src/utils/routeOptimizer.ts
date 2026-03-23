import type { FoodDonation } from "../backend";
import { haversineDistance } from "./haversine";

export interface RouteStop {
  donation: FoodDonation;
  order: number;
  distanceFromPrev: number;
  cumulativeDistance: number;
  estimatedArrivalMinutes: number;
}

export function optimizeRoute(
  donations: FoodDonation[],
  startLat: number,
  startLon: number,
): RouteStop[] {
  // Sort by cookTime (earliest first = most urgent)
  const sorted = [...donations].sort(
    (a, b) => Number(a.cookTime) - Number(b.cookTime),
  );

  let currentLat = startLat;
  let currentLon = startLon;
  let cumulativeDistance = 0;
  let cumulativeMinutes = 0;

  return sorted.map((donation, index) => {
    const dist = haversineDistance(
      currentLat,
      currentLon,
      donation.latitude,
      donation.longitude,
    );
    cumulativeDistance += dist;
    const timeForLeg = Math.round((dist / 30) * 60);
    cumulativeMinutes += timeForLeg;

    currentLat = donation.latitude;
    currentLon = donation.longitude;

    return {
      donation,
      order: index + 1,
      distanceFromPrev: dist,
      cumulativeDistance,
      estimatedArrivalMinutes: cumulativeMinutes,
    };
  });
}
