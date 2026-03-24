import {
  Leaf,
  MapPin,
  Users,
  UtensilsCrossed,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Static data ──────────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    icon: UtensilsCrossed,
    label: "Total Meals Saved",
    value: "50,000",
    iconColor: "#22c55e",
    glowColor: "rgba(34,197,94,0.15)",
    ocid: "impact.meals_saved.card",
  },
  {
    icon: Users,
    label: "People Fed",
    value: "25,000",
    iconColor: "#f97316",
    glowColor: "rgba(249,115,22,0.15)",
    ocid: "impact.people_fed.card",
  },
  {
    icon: Leaf,
    label: "CO₂ Reduced (kg)",
    value: "12,500",
    iconColor: "#22c55e",
    glowColor: "rgba(34,197,94,0.15)",
    ocid: "impact.co2.card",
  },
  {
    icon: MapPin,
    label: "Cities Active",
    value: "3",
    iconColor: "#f97316",
    glowColor: "rgba(249,115,22,0.15)",
    ocid: "impact.cities.card",
  },
];

const CITY_DATA = [
  { city: "Mumbai", meals: 30000 },
  { city: "Pune", meals: 15000 },
  { city: "Nagpur", meals: 5000 },
];

const DONUT_DATA = [
  { name: "Accepted", value: 60, color: "#f97316" },
  { name: "Pending", value: 25, color: "#22c55e" },
  { name: "Rejected", value: 15, color: "#6b7280" },
];

// ── Custom tooltip for bar chart ──────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(10,18,14,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "8px 14px",
        color: "#f1f5f1",
        fontSize: 13,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, color: "#f97316" }}>
        {Number(payload[0].value).toLocaleString("en-IN")} meals
      </div>
    </div>
  );
};

// ── Custom donut label ────────────────────────────────────────────────────────
const renderDonutLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Glass card wrapper ────────────────────────────────────────────────────────
const GlassPanel = ({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) => (
  <div
    className={className}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderRadius: 20,
      boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
    }}
  >
    {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ImpactDashboard() {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handleListen = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text =
      "Our impact in Maharashtra: 50,000 meals saved, 25,000 people fed, 12,500 kilograms of CO2 reduced, active in 3 cities.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      style={{
        background:
          "linear-gradient(160deg, #060d09 0%, #0a1410 50%, #0c1209 100%)",
        minHeight: "100vh",
        padding: "56px 0 80px",
      }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px" }}>
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 99,
                padding: "4px 14px",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#22c55e",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                LIVE METRICS
              </span>
            </div>
            <h1
              data-ocid="impact.section"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                background: "linear-gradient(90deg, #22c55e 0%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 10,
                fontFamily: "Poppins, system-ui, sans-serif",
              }}
            >
              Our Impact in Maharashtra
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.52)",
                fontSize: 15,
                maxWidth: 520,
                lineHeight: 1.6,
              }}
            >
              Real-time metrics on food rescued and lives impacted across
              Maharashtra.
            </p>
          </div>

          {/* Listen button */}
          <button
            data-ocid="impact.listen.button"
            type="button"
            onClick={handleListen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid rgba(34,197,94,0.35)",
              background: isSpeaking
                ? "rgba(34,197,94,0.15)"
                : "rgba(255,255,255,0.04)",
              color: isSpeaking ? "#22c55e" : "rgba(255,255,255,0.75)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              backdropFilter: "blur(8px)",
            }}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isSpeaking ? "Stop" : "Listen"}
          </button>
        </motion.div>

        {/* ── Stats Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
            marginBottom: 32,
          }}
        >
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              data-ocid={card.ocid}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: 20,
                padding: "28px 24px",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* glow bleed */}
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: card.glowColor,
                  filter: "blur(32px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${card.iconColor}18`,
                  border: `1px solid ${card.iconColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <card.icon size={22} color={card.iconColor} />
              </div>
              <div
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 800,
                  color: "#f1f5f1",
                  lineHeight: 1,
                  marginBottom: 6,
                  fontFamily: "Poppins, system-ui, sans-serif",
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 500,
                }}
              >
                {card.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 22,
          }}
        >
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassPanel>
              <div style={{ padding: "28px 28px 20px" }}>
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#f1f5f1",
                      marginBottom: 4,
                    }}
                  >
                    Meals Saved by City
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    Total meals rescued across major cities in Maharashtra
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={CITY_DATA}
                    margin={{ top: 4, right: 8, left: -10, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.07)"
                    />
                    <XAxis
                      dataKey="city"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={<CustomBarTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar
                      dataKey="meals"
                      fill="#f97316"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={52}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassPanel>
              <div style={{ padding: "28px 28px 20px" }}>
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#f1f5f1",
                      marginBottom: 4,
                    }}
                  >
                    Donation Status Breakdown
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    Current status of all submitted donations
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderDonutLabel}
                    >
                      {DONUT_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [`${v}%`, ""]}
                      contentStyle={{
                        background: "rgba(10,18,14,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#f1f5f1",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {DONUT_DATA.map((entry) => (
                    <div
                      key={entry.name}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: entry.color,
                          boxShadow: `0 0 6px ${entry.color}80`,
                        }}
                      />
                      <span
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                      >
                        {entry.name}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: entry.color,
                        }}
                      >
                        {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
