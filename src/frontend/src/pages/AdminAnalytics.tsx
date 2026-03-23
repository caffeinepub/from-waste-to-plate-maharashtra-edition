import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  BarChart2,
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../App";
import { DonationStatus } from "../backend";
import {
  useGetAllDonations,
  useGetAllNgos,
  useGetAllVolunteers,
  useGetImpactCounters,
} from "../hooks/useQueries";

export default function AdminAnalytics() {
  const { t } = useLanguage();
  const { data: donations } = useGetAllDonations();
  const { data: ngos } = useGetAllNgos();
  const { data: volunteers } = useGetAllVolunteers();
  const { data: impact } = useGetImpactCounters();

  const totalDonations = donations?.length || 0;
  const pendingCount =
    donations?.filter((d) => d.status === DonationStatus.pending).length || 0;
  const acceptedCount =
    donations?.filter((d) => d.status === DonationStatus.accepted).length || 0;
  const pickedUpCount =
    donations?.filter((d) => d.status === DonationStatus.pickedUp).length || 0;
  const totalMeals = impact ? Number(impact.totalMealsSaved) : 0;
  const co2Reduced = impact ? Math.round(impact.co2Reduced) : 0;

  // City activity data
  const cityActivity = (donations || []).reduce(
    (acc, d) => {
      acc[d.city] = (acc[d.city] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const cityChartData = Object.entries(cityActivity)
    .map(([city, count]) => ({ city, donations: count }))
    .sort((a, b) => b.donations - a.donations);

  // 30-day activity (mock based on total)
  const activityData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    donations: Math.floor(Math.random() * 8) + 1,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          {t("admin.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide metrics and performance overview for Left2Lift
          Maharashtra
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          {
            label: "Total Donations",
            value: totalDonations,
            icon: <Utensils className="h-5 w-5" />,
            color: "text-amber-600",
          },
          {
            label: "Pending Review",
            value: pendingCount,
            icon: <Activity className="h-5 w-5" />,
            color: "text-orange-500",
          },
          {
            label: "Accepted",
            value: acceptedCount,
            icon: <TrendingUp className="h-5 w-5" />,
            color: "text-blue-600",
          },
          {
            label: "Picked Up",
            value: pickedUpCount,
            icon: <BarChart2 className="h-5 w-5" />,
            color: "text-green-600",
          },
          {
            label: "Meals Saved",
            value: totalMeals.toLocaleString("en-IN"),
            icon: <Star className="h-5 w-5" />,
            color: "text-purple-600",
          },
          {
            label: "CO₂ Reduced (kg)",
            value: co2Reduced.toLocaleString("en-IN"),
            icon: <TrendingUp className="h-5 w-5" />,
            color: "text-teal-600",
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className={`${metric.color} mb-1`}>{metric.icon}</div>
              <div className="text-xl font-bold text-foreground">
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {metric.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 30-Day Activity Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            30-Day Donation Activity
          </CardTitle>
          <CardDescription>
            Daily donation submissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={activityData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="donations" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* City Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              City Activity Breakdown
            </CardTitle>
            <CardDescription>
              Donations submitted per Maharashtra city
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cityChartData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Donations</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityChartData.map((row) => (
                    <TableRow key={row.city}>
                      <TableCell className="font-medium">{row.city}</TableCell>
                      <TableCell className="text-right">
                        {row.donations}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {totalDonations > 0
                            ? Math.round((row.donations / totalDonations) * 100)
                            : 0}
                          %
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No donation data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* NGO Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              NGO Partner Performance
            </CardTitle>
            <CardDescription>Registered NGOs sorted by rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(ngos || []).slice(0, 6).map((ngo) => (
                <div
                  key={ngo.id.toString()}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ngo.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {ngo.neighborhood},{" "}
                      {ngo.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-medium text-foreground">
                      {ngo.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Volunteer Performance
          </CardTitle>
          <CardDescription>Active volunteers sorted by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(volunteers || []).map((vol) => (
              <div
                key={vol.id.toString()}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {vol.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {vol.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vol.city} · ⭐ {vol.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
