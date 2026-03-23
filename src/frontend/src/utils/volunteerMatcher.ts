import type { Volunteer } from "../backend";
import { haversineDistance } from "./haversine";

export interface VolunteerMatch {
  volunteer: Volunteer;
  distanceKm: number;
}

export function matchVolunteer(
  donorLat: number,
  donorLon: number,
  volunteers: Volunteer[],
): VolunteerMatch | null {
  if (!volunteers.length) return null;

  const matches = volunteers.map((v) => ({
    volunteer: v,
    distanceKm: haversineDistance(donorLat, donorLon, v.latitude, v.longitude),
  }));

  matches.sort((a, b) => {
    const distScore = a.distanceKm - b.distanceKm;
    const ratingScore = Number(b.volunteer.rating) - Number(a.volunteer.rating);
    return distScore * 0.6 + ratingScore * 0.4;
  });

  return matches[0];
}
