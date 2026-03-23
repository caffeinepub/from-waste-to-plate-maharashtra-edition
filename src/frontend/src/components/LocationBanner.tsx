import { MapPin, X } from "lucide-react";
import React from "react";

interface LocationBannerProps {
  isActive: boolean;
  onDismiss?: () => void;
}

export default function LocationBanner({
  isActive,
  onDismiss,
}: LocationBannerProps) {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 mb-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 shrink-0" />
        <span>Showing results near your current location</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-0.5 rounded hover:bg-primary/20 transition-colors"
          aria-label="Dismiss location banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
