import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  Building2,
  CheckCircle,
  Clock,
  LogOut,
  Package,
  Plus,
  Truck,
  XCircle,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { DonationStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllDonations,
  useGetCallerUserProfile,
} from "../hooks/useQueries";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  [DonationStatus.pending]: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    icon: Clock,
  },
  [DonationStatus.accepted]: {
    label: "Accepted",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: CheckCircle,
  },
  [DonationStatus.rejected]: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: XCircle,
  },
  [DonationStatus.confirmed]: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: CheckCircle,
  },
  [DonationStatus.pickedUp]: {
    label: "Picked Up",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: Truck,
  },
};

export default function HotelDashboard() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allDonations, isLoading: donationsLoading } =
    useGetAllDonations();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/login/hotel" });
  };

  // For demo purposes, show all donations (in a real app, filter by donor principal)
  const myDonations = allDonations ?? [];

  const stats = {
    total: myDonations.length,
    pending: myDonations.filter((d) => d.status === DonationStatus.pending)
      .length,
    accepted: myDonations.filter(
      (d) =>
        d.status === DonationStatus.accepted ||
        d.status === DonationStatus.confirmed,
    ).length,
    pickedUp: myDonations.filter((d) => d.status === DonationStatus.pickedUp)
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/10 dark:via-background dark:to-orange-950/10">
      {/* Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
              <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight">
                Hotel Dashboard
              </h1>
              {userProfile && (
                <p className="text-xs text-muted-foreground">
                  {userProfile.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/impact" })}
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground"
            >
              <BarChart2 className="h-4 w-4" />
              Impact
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back{userProfile ? `, ${userProfile.name}` : ""}! 👋
          </h2>
          <p className="text-amber-100 text-sm">
            Every meal you donate helps feed someone in need. Thank you for
            making a difference.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Donations",
              value: stats.total,
              color: "text-amber-600",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "text-yellow-600",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              color: "text-emerald-600",
            },
            {
              label: "Picked Up",
              value: stats.pickedUp,
              color: "text-purple-600",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-2xl p-4 text-center"
            >
              <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Post Donation CTA */}
        <div className="bg-card border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
              <Plus className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                Post a New Food Donation
              </h3>
              <p className="text-sm text-muted-foreground">
                Have surplus food? Post it now and we'll connect you with NGOs
                nearby.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate({ to: "/donate-food" })}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl border-0 whitespace-nowrap"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Donate Food
          </Button>
        </div>

        {/* Donations List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-foreground text-lg">
              Your Donations
            </h3>
          </div>

          {donationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : myDonations.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">
                No donations yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Post your first food donation to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDonations
                .slice()
                .reverse()
                .map((donation) => {
                  const status =
                    statusConfig[donation.status] ??
                    statusConfig[DonationStatus.pending];
                  const StatusIcon = status.icon;
                  const date = new Date(Number(donation.timestamp) / 1_000_000);
                  return (
                    <div
                      key={String(donation.id)}
                      className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl shrink-0">
                          <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {donation.foodType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {donation.quantity} {donation.unit} ·{" "}
                            {donation.city}, {donation.neighborhood}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${status.color}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground mt-12">
        <p>
          © {new Date().getFullYear()} Left2Lift. Built with{" "}
          <span className="text-red-500">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
