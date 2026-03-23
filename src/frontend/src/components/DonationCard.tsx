import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  XCircle,
} from "lucide-react";
import React from "react";
import { useEmergencyMode } from "../App";
import type { FoodDonation } from "../backend";
import { computeFoodSafety } from "../utils/foodSafetyEngine";
import { estimatePickupMinutes, haversineDistance } from "../utils/haversine";
import { FoodSafetyBadge } from "./FoodSafetyBadge";

interface DonationCardProps {
  donation: FoodDonation;
  ngoLat?: number;
  ngoLon?: number;
  onAccept?: (id: bigint) => void;
  onReject?: (id: bigint) => void;
  isUpdating?: boolean;
  showActions?: boolean;
}

export function DonationCard({
  donation,
  ngoLat,
  ngoLon,
  onAccept,
  onReject,
  isUpdating,
  showActions = true,
}: DonationCardProps) {
  const { emergencyMode } = useEmergencyMode();

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

  const distance =
    ngoLat != null && ngoLon != null
      ? haversineDistance(donation.latitude, donation.longitude, ngoLat, ngoLon)
      : null;
  const pickupMin = distance != null ? estimatePickupMinutes(distance) : null;

  const priorityLabel =
    safety.status === "unsafe"
      ? "Critical"
      : safety.status === "urgent"
        ? "High"
        : "Normal";

  const priorityClass =
    safety.status === "unsafe"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      : safety.status === "urgent"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

  const statusColors: Record<string, string> = {
    pending: "text-yellow-600",
    accepted: "text-green-600",
    rejected: "text-red-600",
    confirmed: "text-blue-600",
  };

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        emergencyMode ? "border-2 border-red-400" : ""
      }`}
    >
      {emergencyMode && (
        <div className="mb-3 flex items-center gap-2 text-red-600 text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          EMERGENCY PRIORITY
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground">{donation.foodType}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityClass}`}
            >
              {priorityLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {donation.quantity} {donation.unit} · by {donation.donorName}
          </p>
        </div>
        <FoodSafetyBadge result={safety} compact />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>
            {donation.neighborhood}, {donation.city}
          </span>
        </div>
        {distance != null && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>
              {distance.toFixed(1)} km · ~{pickupMin} min
            </span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground">
          {safety.message}
        </p>
      </div>

      {showActions && donation.status === "pending" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAccept?.(donation.id)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => onReject?.(donation.id)}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}

      {donation.status !== "pending" && (
        <div
          className={`text-xs font-semibold capitalize ${statusColors[donation.status] ?? ""}`}
        >
          Status: {donation.status}
        </div>
      )}
    </div>
  );
}
