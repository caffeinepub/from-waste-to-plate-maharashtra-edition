import { Clock, MapPin, Navigation, Route } from "lucide-react";
import React from "react";
import { GlassCard } from "./GlassCard";

interface RouteMapPreviewProps {
  donorLat: number;
  donorLon: number;
  ngoLat: number;
  ngoLon: number;
  donorLabel: string;
  ngoLabel: string;
  distanceKm: number;
  estimatedMinutes: number;
}

export function RouteMapPreview({
  donorLat,
  donorLon,
  ngoLat,
  ngoLon,
  donorLabel,
  ngoLabel,
  distanceKm,
  estimatedMinutes,
}: RouteMapPreviewProps) {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(donorLon, ngoLon) - 0.02},${Math.min(donorLat, ngoLat) - 0.02},${Math.max(donorLon, ngoLon) + 0.02},${Math.max(donorLat, ngoLat) + 0.02}&layer=mapnik&marker=${donorLat},${donorLon}`;

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex items-center gap-2 text-brand-orange font-semibold">
        <Route className="w-4 h-4" />
        <span>Route Preview</span>
      </div>

      {/* Route summary */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-green" />
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-semibold">{donorLabel}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground">→</div>
        <div className="flex-1 rounded-xl p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-brand-orange" />
            <div>
              <p className="text-xs text-muted-foreground">Deliver to</p>
              <p className="text-sm font-semibold">{ngoLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Route className="w-3.5 h-3.5 text-brand-green" />
          <span>
            <strong>{distanceKm.toFixed(1)} km</strong> total
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          <span>
            <strong>~{estimatedMinutes} min</strong> estimated
          </span>
        </div>
      </div>

      {/* Map embed */}
      <div className="rounded-xl overflow-hidden border border-border h-48">
        <iframe
          title="Route Map"
          src={osmUrl}
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
    </div>
  );
}
