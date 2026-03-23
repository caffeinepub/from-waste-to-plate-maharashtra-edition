import { Bell, Clock, MapPin, Star, User } from "lucide-react";
import React from "react";
import type { VolunteerMatch } from "../utils/volunteerMatcher";

interface VolunteerAssignmentCardProps {
  match: VolunteerMatch;
  foodType: string;
  quantity: number;
  unit: string;
  neighborhood: string;
  remainingHours: number;
}

export function VolunteerAssignmentCard({
  match,
  foodType,
  quantity,
  unit,
  neighborhood,
  remainingHours,
}: VolunteerAssignmentCardProps) {
  const urgencyText =
    remainingHours < 1
      ? `${Math.round(remainingHours * 60)} minutes`
      : `${remainingHours.toFixed(1)} hours`;

  return (
    <div className="rounded-2xl p-4 border-2 border-brand-orange bg-orange-50 dark:bg-orange-900/20 animate-scale-in">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-brand-orange animate-bounce-gentle" />
        <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">
          Volunteer Assigned
        </span>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
            <User className="w-5 h-5 text-brand-orange" />
          </div>
          <div>
            <p className="font-bold text-foreground">{match.volunteer.name}</p>
            <p className="text-xs text-muted-foreground">
              {match.volunteer.availability}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold">
            {Number(match.volunteer.rating).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 text-sm mb-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-brand-orange" />
          <span>{match.distanceKm.toFixed(1)} km away</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          <span>~{Math.round((match.distanceKm / 30) * 60)} min ETA</span>
        </div>
      </div>

      <div className="rounded-lg p-3 bg-orange-100 dark:bg-orange-900/30 text-sm">
        <p className="font-medium text-orange-800 dark:text-orange-300">
          "Urgent food pickup near {neighborhood}. {quantity} {unit} of{" "}
          {foodType} expiring in {urgencyText}."
        </p>
      </div>
    </div>
  );
}
