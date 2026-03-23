import {
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Package,
  Truck,
} from "lucide-react";
import React from "react";
import type { FoodDonation } from "../backend";
import { useCountdownTimer } from "../hooks/useCountdownTimer";
import { computeFoodSafety } from "../utils/foodSafetyEngine";

interface AssignmentCardProps {
  donation: FoodDonation;
  ngoName: string;
  ngoNeighborhood: string;
  distanceKm: number;
  onMarkPickedUp: (id: bigint) => void;
  onMarkDelivered: (id: bigint) => void;
  isUpdating?: boolean;
}

export function AssignmentCard({
  donation,
  ngoName,
  ngoNeighborhood,
  distanceKm,
  onMarkPickedUp,
  onMarkDelivered,
  isUpdating,
}: AssignmentCardProps) {
  const storageKey =
    donation.storageCondition === "refrigerated"
      ? "refrigerated"
      : donation.storageCondition === "hotStorage"
        ? "hotStorage"
        : "roomTemperature";

  const safety = computeFoodSafety(
    donation.foodType,
    Number(donation.cookTime),
    storageKey,
    donation.city,
  );
  const expiryMs = safety.expiryTime.getTime();
  const totalDurationMs = 8 * 3600 * 1000;

  const { remainingText, urgencyBorderClass, urgencyLevel } = useCountdownTimer(
    expiryMs,
    totalDurationMs,
  );

  const urgencyBg =
    urgencyLevel === "safe"
      ? "bg-green-50 dark:bg-green-900/10"
      : urgencyLevel === "urgent"
        ? "bg-yellow-50 dark:bg-yellow-900/10"
        : "bg-red-50 dark:bg-red-900/10";

  return (
    <div
      className={`glass-card rounded-2xl p-5 ${urgencyBorderClass} ${urgencyBg} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-green" />
          <h3 className="font-bold text-foreground">{donation.foodType}</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 text-sm font-bold ${
            urgencyLevel === "safe"
              ? "text-green-600"
              : urgencyLevel === "urgent"
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          <Clock className="w-4 h-4" />
          {remainingText}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {donation.quantity} {donation.unit} · {donation.donorName}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
          <span className="text-muted-foreground">Pickup: </span>
          <span className="font-medium">
            {donation.neighborhood}, {donation.city}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
          <span className="text-muted-foreground">Deliver to: </span>
          <span className="font-medium">
            {ngoName}, {ngoNeighborhood}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Truck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            {distanceKm.toFixed(1)} km · ~{Math.round((distanceKm / 30) * 60)}{" "}
            min
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {donation.status === "accepted" && (
          <button
            type="button"
            onClick={() => onMarkPickedUp(donation.id)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Picked Up
          </button>
        )}
        {donation.status === "confirmed" && (
          <button
            type="button"
            onClick={() => onMarkDelivered(donation.id)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-green text-white text-sm font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-50"
          >
            <Truck className="w-4 h-4" />
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
}
