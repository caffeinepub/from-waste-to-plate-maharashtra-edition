import type { NGO } from "../backend";
import { haversineDistance } from "./haversine";

export interface NgoMatch {
  ngo: NGO;
  distanceKm: number;
  urgencyScore: number;
  estimatedPickupMinutes: number;
}

export function matchNgos(
  donorLat: number,
  donorLon: number,
  ngos: NGO[],
  remainingHours: number,
): NgoMatch[] {
  const matches: NgoMatch[] = ngos.map((ngo) => {
    const distanceKm = haversineDistance(
      donorLat,
      donorLon,
      ngo.latitude,
      ngo.longitude,
    );
    const capacityScore = Math.min(Number(ngo.capacity) / 1000, 1.0);
    // Urgency Score = (remainingHours × 0.4) + (1/distance × 0.4) + (capacityScore × 0.2)
    const urgencyScore =
      remainingHours * 0.4 +
      (1 / Math.max(distanceKm, 0.1)) * 0.4 +
      capacityScore * 0.2;
    const estimatedPickupMinutes = Math.round((distanceKm / 20) * 60 + 5);
    return { ngo, distanceKm, urgencyScore, estimatedPickupMinutes };
  });

  // Sort by urgency score descending (higher = better match)
  return matches.sort((a, b) => b.urgencyScore - a.urgencyScore);
}
