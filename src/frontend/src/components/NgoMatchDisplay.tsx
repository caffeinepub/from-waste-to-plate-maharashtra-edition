import { Clock, MapPin, Star, Zap } from "lucide-react";
import React from "react";
import type { NgoMatch } from "../utils/ngoMatcher";
import { GlassCard } from "./GlassCard";

interface NgoMatchDisplayProps {
  matches: NgoMatch[];
}

export function NgoMatchDisplay({ matches }: NgoMatchDisplayProps) {
  if (!matches.length) return null;

  const [best, ...rest] = matches.slice(0, 3);

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex items-center gap-2 text-brand-green font-semibold">
        <Zap className="w-4 h-4" />
        <span>AI-Matched NGOs</span>
      </div>

      {/* Best match */}
      <div className="rounded-2xl p-4 border-2 border-brand-green bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs font-bold text-brand-green uppercase tracking-wide">
              Best Match
            </span>
            <h3 className="font-bold text-foreground text-lg">
              {best.ngo.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {best.ngo.neighborhood}, {best.ngo.city}
            </p>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">
              {Number(best.ngo.rating).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-brand-green" />
            <span className="font-medium">
              {best.distanceKm.toFixed(1)} km away
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-brand-orange" />
            <span className="font-medium">
              ~{best.estimatedPickupMinutes} min pickup
            </span>
          </div>
        </div>
        <p className="text-xs text-brand-green font-medium mt-2">
          Nearest trust found {best.distanceKm.toFixed(1)} km away – Estimated
          pickup in {best.estimatedPickupMinutes} minutes
        </p>
      </div>

      {/* Other matches */}
      {rest.map((match, i) => (
        <div
          key={Number(match.ngo.id)}
          className="rounded-xl p-3 border border-border bg-card/50 flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-muted-foreground">#{i + 2}</span>
            <p className="font-semibold text-sm">{match.ngo.name}</p>
            <p className="text-xs text-muted-foreground">
              {match.ngo.neighborhood}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-medium">{match.distanceKm.toFixed(1)} km</p>
            <p>~{match.estimatedPickupMinutes} min</p>
          </div>
        </div>
      ))}
    </div>
  );
}
