import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Leaf,
  MapPin,
  TrendingUp,
  Trophy,
  Users,
  Utensils,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../App";
import { useGetAllDonations, useGetImpactCounters } from "../hooks/useQueries";

const CHART_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export default function ImpactDashboard() {
  const { t } = useLanguage();
  const { data: impact } = useGetImpactCounters();
  const { data: donations } = useGetAllDonations();
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const totalMeals = impact ? Number(impact.totalMealsSaved) : 0;
  const totalPeople = impact ? Number(impact.totalPeopleFed) : 0;
  const co2Reduced = impact ? impact.co2Reduced : 0;
  const cityBreakdown = impact?.cityBreakdown || [];

  // City bar chart data
  const cityChartData = cityBreakdown.map(([city, meals]) => ({
    city,
    meals: Number(meals),
  }));

  // Donation status donut
  const statusCounts = (donations || []).reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const donutData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Weekly trend (mock based on total)
  const weeklyData = [
    { day: "Mon", meals: Math.floor(totalMeals * 0.12) },
    { day: "Tue", meals: Math.floor(totalMeals * 0.15) },
    { day: "Wed", meals: Math.floor(totalMeals * 0.18) },
    { day: "Thu", meals: Math.floor(totalMeals * 0.14) },
    { day: "Fri", meals: Math.floor(totalMeals * 0.2) },
    { day: "Sat", meals: Math.floor(totalMeals * 0.11) },
    { day: "Sun", meals: Math.floor(totalMeals * 0.1) },
  ];

  // Donor leaderboard from donations
  const donorMap = (donations || []).reduce(
    (acc, d) => {
      acc[d.donorName] = (acc[d.donorName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const leaderboard = Object.entries(donorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const summary = `Left2Lift Impact Summary: We have saved ${totalMeals.toLocaleString()} meals and fed ${totalPeople.toLocaleString()} people across Maharashtra. We have reduced carbon emissions by ${Math.round(co2Reduced)} kilograms. Our top cities are ${cityBreakdown.map(([c]) => c).join(", ")}.`;

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            {t("impact.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time metrics on food rescued and lives impacted across
            Maharashtra
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSpeak}
          className="gap-2 shrink-0"
        >
          {isSpeaking ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {isSpeaking ? "Stop" : "Listen"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: <Utensils className="h-6 w-6" />,
            label: "Total Meals Saved",
            value: totalMeals.toLocaleString("en-IN"),
            color: "text-amber-600",
          },
          {
            icon: <Users className="h-6 w-6" />,
            label: "People Fed",
            value: totalPeople.toLocaleString("en-IN"),
            color: "text-blue-600",
          },
          {
            icon: <Leaf className="h-6 w-6" />,
            label: "CO₂ Reduced (kg)",
            value: Math.round(co2Reduced).toLocaleString("en-IN"),
            color: "text-green-600",
          },
          {
            icon: <MapPin className="h-6 w-6" />,
            label: "Cities Active",
            value: cityBreakdown.length.toString(),
            color: "text-purple-600",
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`${card.color} mb-2`}>{card.icon}</div>
              <div className="text-2xl font-bold text-foreground">
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {card.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* City Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Meals Saved by City
            </CardTitle>
            <CardDescription>
              Total meals rescued per Maharashtra city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={cityChartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [
                    Number(v).toLocaleString("en-IN"),
                    "Meals",
                  ]}
                />
                <Bar dataKey="meals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donation Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-4 w-4 text-primary" />
              Donation Status Breakdown
            </CardTitle>
            <CardDescription>
              Current status of all submitted donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {donutData.map((entry, colorIdx) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[colorIdx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                No donation data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Meal Rescue Trend
            </CardTitle>
            <CardDescription>
              Estimated daily meal distribution this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [
                    Number(v).toLocaleString("en-IN"),
                    "Meals",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="meals"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donor Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Donors
            </CardTitle>
            <CardDescription>
              Most active food donors on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-slate-100 text-slate-600"
                            : i === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {count} donation{count > 1 ? "s" : ""}
                      </p>
                    </div>
                    {i === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        🏆 Top Donor
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">
                No donor data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
