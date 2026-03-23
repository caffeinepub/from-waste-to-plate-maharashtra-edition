import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useEmergencyMode, useLanguage } from "../App";
import type { FoodDonation } from "../backend";
import { DonationStatus } from "../backend";
import {
  useGetAllDonations,
  useGetPendingDonations,
  useUpdateDonationStatus,
} from "../hooks/useQueries";
import { computeFoodSafety } from "../utils/foodSafetyEngine";
import { estimatePickupMinutes, haversineDistance } from "../utils/haversine";

const NGO_LOCATION = { lat: 19.1197, lon: 72.8468 };

function SafetyBadgeSmall({ status }: { status: string; message?: string }) {
  const colors = {
    safe: "bg-green-100 text-green-700 border-green-300",
    urgent: "bg-yellow-100 text-yellow-700 border-yellow-300",
    unsafe: "bg-red-100 text-red-700 border-red-300",
  };
  const labels = { safe: "🟢 Safe", urgent: "🟡 Urgent", unsafe: "🔴 Unsafe" };
  const key = status as "safe" | "urgent" | "unsafe";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[key] ?? colors.safe}`}
    >
      {labels[key] ?? "🟢 Safe"}
    </span>
  );
}

function PriorityBadge({
  priority,
  emergency,
}: { priority: string; emergency: boolean }) {
  const colors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  const label = emergency ? "high" : priority;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[label as keyof typeof colors] ?? colors.low}`}
    >
      {label.toUpperCase()}
    </span>
  );
}

function DonationCard({
  donation,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  emergency,
}: {
  donation: FoodDonation;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  emergency: boolean;
}) {
  const cookTimeMs = Number(donation.cookTime) / 1_000_000;
  const safety = computeFoodSafety(
    donation.foodType,
    Number(donation.cookTime),
    donation.storageCondition,
    donation.city,
  );
  const distance = haversineDistance(
    NGO_LOCATION.lat,
    NGO_LOCATION.lon,
    donation.latitude,
    donation.longitude,
  );
  const pickupMin = estimatePickupMinutes(distance);

  let priority = "low";
  if (emergency || safety.remainingHours < 1) priority = "high";
  else if (safety.remainingHours < 3) priority = "medium";

  const cookDate = new Date(cookTimeMs);

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-300 ${emergency ? "border-2 border-red-400" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {donation.foodType}
          </h3>
          <p className="text-muted-foreground text-sm">
            by {donation.donorName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <PriorityBadge priority={priority} emergency={emergency} />
          <SafetyBadgeSmall status={safety.status} message={safety.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>🍽️</span> {donation.quantity} {donation.unit}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" /> {donation.neighborhood},{" "}
          {donation.city}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" /> Cooked:{" "}
          {cookDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-1 text-primary font-medium">
          📍 {distance.toFixed(1)} km · ⏱ {pickupMin} min
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 italic">
        {safety.message}
      </p>

      {/* Mini Map */}
      <div
        className="rounded-xl overflow-hidden border border-border mb-4"
        style={{ height: 120 }}
      >
        <iframe
          title={`Map for ${donation.id}`}
          width="100%"
          height="120"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${donation.longitude - 0.02},${donation.latitude - 0.02},${donation.longitude + 0.02},${donation.latitude + 0.02}&layer=mapnik&marker=${donation.latitude},${donation.longitude}`}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          disabled={isAccepting || isRejecting}
          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {isAccepting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Accept
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isAccepting || isRejecting}
          className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {isRejecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Reject
        </button>
      </div>
    </div>
  );
}

export default function NgoDashboard() {
  const { t } = useLanguage();
  const { emergencyMode } = useEmergencyMode();
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [actioningId, setActioningId] = useState<{
    id: bigint;
    action: "accept" | "reject";
  } | null>(null);

  const { data: pendingDonations, isLoading: pendingLoading } =
    useGetPendingDonations();
  const { data: allDonations, isLoading: allLoading } = useGetAllDonations();
  const updateStatus = useUpdateDonationStatus();

  const handleAction = async (
    donation: FoodDonation,
    action: "accept" | "reject",
  ) => {
    setActioningId({ id: donation.id, action });
    try {
      const newStatus =
        action === "accept" ? DonationStatus.accepted : DonationStatus.rejected;
      await updateStatus.mutateAsync({ id: donation.id, status: newStatus });
      if (action === "accept") {
        toast.success(
          `✅ Donation accepted — ${donation.foodType} from ${donation.donorName}`,
        );
      } else {
        toast.info("❌ Donation rejected");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Action failed");
    } finally {
      setActioningId(null);
    }
  };

  const sortedPending = [...(pendingDonations ?? [])].sort((a, b) => {
    if (emergencyMode) {
      return Number(a.cookTime) - Number(b.cookTime);
    }
    const distA = haversineDistance(
      NGO_LOCATION.lat,
      NGO_LOCATION.lon,
      a.latitude,
      a.longitude,
    );
    const distB = haversineDistance(
      NGO_LOCATION.lat,
      NGO_LOCATION.lon,
      b.latitude,
      b.longitude,
    );
    return distA - distB;
  });

  const isLoading = activeTab === "pending" ? pendingLoading : allLoading;
  const donations =
    activeTab === "pending" ? sortedPending : (allDonations ?? []);

  return (
    <div
      className={`min-h-screen py-10 px-4 ${emergencyMode ? "bg-red-50 dark:bg-red-950/20" : "bg-background"}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground">
              🏢 {t("ngo.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage incoming food donations
            </p>
          </div>
          {emergencyMode && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Mode
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "all"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {tab === "pending"
                ? `${t("ngo.pending")} (${pendingDonations?.length ?? 0})`
                : t("ngo.all")}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["s1", "s2", "s3", "s4"].map((sk) => (
              <div
                key={sk}
                className="bg-card border border-border rounded-2xl p-5 space-y-3"
              >
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-medium">No donations found</p>
            <p className="text-sm mt-2">
              Check back soon for new food donations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donations.map((donation) => (
              <DonationCard
                key={donation.id.toString()}
                donation={donation}
                emergency={emergencyMode}
                onAccept={() => handleAction(donation, "accept")}
                onReject={() => handleAction(donation, "reject")}
                isAccepting={
                  actioningId?.id === donation.id &&
                  actioningId?.action === "accept"
                }
                isRejecting={
                  actioningId?.id === donation.id &&
                  actioningId?.action === "reject"
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
