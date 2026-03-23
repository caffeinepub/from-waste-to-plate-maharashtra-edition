import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Loader2, MapPin, Truck } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEmergencyMode, useLanguage } from "../App";
import type { FoodDonation, Volunteer } from "../backend";
import {
  useClaimDonation,
  useGetAllVolunteers,
  useGetAvailableDonationsForVolunteers,
} from "../hooks/useQueries";
import { computeFoodSafety } from "../utils/foodSafetyEngine";
import { estimatePickupMinutes, haversineDistance } from "../utils/haversine";

const VOLUNTEER_LOCATION = { lat: 19.076, lon: 72.8777 };

function CountdownTimer({
  expiryTime,
  status,
}: { expiryTime: Date; status: string }) {
  const [remaining, setRemaining] = useState("");
  const [color, setColor] = useState("text-green-600");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = expiryTime.getTime() - now;
      if (diff <= 0) {
        setRemaining("Expired");
        setColor("text-red-600");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${hours}h ${minutes}m`);
      if (status === "unsafe" || hours < 1) setColor("text-red-600");
      else if (status === "urgent" || hours < 3) setColor("text-yellow-600");
      else setColor("text-green-600");
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiryTime, status]);

  return (
    <span className={`font-bold tabular-nums ${color}`}>⏱ {remaining}</span>
  );
}

function AssignmentCard({
  donation,
  volunteer,
  onClaim,
  isClaiming,
  emergency,
}: {
  donation: FoodDonation;
  volunteer: Volunteer | null;
  onClaim: () => void;
  isClaiming: boolean;
  emergency: boolean;
}) {
  const safety = computeFoodSafety(
    donation.foodType,
    Number(donation.cookTime),
    donation.storageCondition,
    donation.city,
  );
  const distance = haversineDistance(
    VOLUNTEER_LOCATION.lat,
    VOLUNTEER_LOCATION.lon,
    donation.latitude,
    donation.longitude,
  );
  const pickupMin = estimatePickupMinutes(distance);

  const urgencyColors = {
    safe: "border-green-200",
    urgent: "border-yellow-400",
    unsafe: "border-red-500",
  };

  return (
    <div
      className={`bg-card border-2 rounded-2xl p-5 hover:shadow-md transition-all duration-300 ${emergency ? "border-red-500" : urgencyColors[safety.status]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {donation.foodType}
          </h3>
          <p className="text-muted-foreground text-sm">
            <MapPin className="w-3 h-3 inline mr-1" />
            {donation.neighborhood}, {donation.city}
          </p>
        </div>
        <CountdownTimer expiryTime={safety.expiryTime} status={safety.status} />
      </div>

      <div
        className={`p-3 rounded-xl mb-3 text-sm font-medium ${
          emergency || safety.status === "unsafe"
            ? "bg-red-100 text-red-700"
            : safety.status === "urgent"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
        }`}
      >
        {emergency || safety.status === "unsafe"
          ? `🚨 Urgent food pickup near ${donation.neighborhood}. ${donation.quantity} ${donation.unit} expiring soon!`
          : safety.status === "urgent"
            ? `⚡ Priority pickup near ${donation.neighborhood}. ${donation.quantity} ${donation.unit} expiring in ${safety.remainingHours.toFixed(1)} hours.`
            : `✅ Food pickup near ${donation.neighborhood}. ${donation.quantity} ${donation.unit} available.`}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="text-muted-foreground">
          🍽️ {donation.quantity} {donation.unit}
        </div>
        <div className="text-primary font-medium">
          📍 {distance.toFixed(1)} km away
        </div>
        <div className="text-muted-foreground">
          🏠 {donation.storageCondition}
        </div>
        <div className="text-orange-600 font-medium">
          ⏱ ~{pickupMin} min ETA
        </div>
      </div>

      {volunteer && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm mb-3">
          <span className="text-muted-foreground">Assigned to:</span>
          <span className="font-medium text-foreground">{volunteer.name}</span>
          <span className="text-yellow-500">⭐ {volunteer.rating}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onClaim}
        disabled={isClaiming}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isClaiming ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Truck className="w-4 h-4" />
        )}
        {isClaiming ? "Claiming..." : "Claim Pickup"}
      </button>
    </div>
  );
}

export default function VolunteerDashboard() {
  const { t } = useLanguage();
  const { emergencyMode } = useEmergencyMode();
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<bigint | null>(
    null,
  );
  const [claimingId, setClaimingId] = useState<bigint | null>(null);

  const { data: donations, isLoading: donationsLoading } =
    useGetAvailableDonationsForVolunteers();
  const { data: volunteers, isLoading: volunteersLoading } =
    useGetAllVolunteers();
  const claimMutation = useClaimDonation();

  const isLoading = donationsLoading || volunteersLoading;

  const sortedDonations = [...(donations ?? [])].sort((a, b) => {
    if (emergencyMode) return Number(a.cookTime) - Number(b.cookTime);
    const safetyA = computeFoodSafety(
      a.foodType,
      Number(a.cookTime),
      a.storageCondition,
      a.city,
    );
    const safetyB = computeFoodSafety(
      b.foodType,
      Number(b.cookTime),
      b.storageCondition,
      b.city,
    );
    return safetyA.remainingHours - safetyB.remainingHours;
  });

  const handleClaim = async (donation: FoodDonation) => {
    if (!selectedVolunteerId && volunteers && volunteers.length > 0) {
      setSelectedVolunteerId(volunteers[0].id);
    }
    const volId = selectedVolunteerId ?? volunteers?.[0]?.id;
    if (!volId) {
      toast.error("Please select a volunteer first");
      return;
    }
    setClaimingId(donation.id);
    try {
      await claimMutation.mutateAsync({
        donationId: donation.id,
        volunteerId: volId,
      });
      toast.success("🚚 Pickup claimed successfully – en route!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to claim pickup");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div
      className={`min-h-screen py-10 px-4 ${emergencyMode ? "bg-red-50 dark:bg-red-950/20" : "bg-background"}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground">
              🚚 {t("volunteer.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Available food pickups near you
            </p>
          </div>
          {emergencyMode && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Mode
            </div>
          )}
        </div>

        {/* Volunteer Selector */}
        {!isLoading && volunteers && volunteers.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <p className="block text-sm font-semibold text-foreground mb-2">
              Select Your Volunteer Profile:
            </p>
            <div className="flex flex-wrap gap-2">
              {volunteers.map((v) => (
                <button
                  type="button"
                  key={v.id.toString()}
                  onClick={() => setSelectedVolunteerId(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedVolunteerId === v.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v.name} · ⭐ {v.rating} · {v.city}
                </button>
              ))}
            </div>
          </div>
        )}

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
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : sortedDonations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-medium">
              No pickups available right now
            </p>
            <p className="text-sm mt-2">
              Check back soon — new donations are added regularly
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedDonations.map((donation) => {
              const assignedVolunteer =
                donation.claimedBy != null
                  ? (volunteers?.find((v) => v.id === donation.claimedBy) ??
                    null)
                  : null;
              return (
                <AssignmentCard
                  key={donation.id.toString()}
                  donation={donation}
                  volunteer={assignedVolunteer}
                  onClaim={() => handleClaim(donation)}
                  isClaiming={claimingId === donation.id}
                  emergency={emergencyMode}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
