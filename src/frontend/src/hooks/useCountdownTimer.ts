import { useEffect, useState } from "react";

export type UrgencyLevel = "safe" | "urgent" | "unsafe";

interface CountdownResult {
  remainingMs: number;
  remainingText: string;
  percentage: number;
  urgencyLevel: UrgencyLevel;
  urgencyColor: string;
  urgencyBorderClass: string;
}

export function useCountdownTimer(
  expiryTimestampMs: number,
  totalDurationMs: number,
): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = Math.max(0, expiryTimestampMs - now);
  const remainingHours = remainingMs / (1000 * 60 * 60);
  const percentage = Math.min(100, (remainingMs / totalDurationMs) * 100);

  let urgencyLevel: UrgencyLevel;
  let urgencyColor: string;
  let urgencyBorderClass: string;

  if (remainingHours >= 3) {
    urgencyLevel = "safe";
    urgencyColor = "#16a34a";
    urgencyBorderClass = "border-l-4 border-green-500";
  } else if (remainingHours >= 1) {
    urgencyLevel = "urgent";
    urgencyColor = "#d97706";
    urgencyBorderClass = "border-l-4 border-yellow-500";
  } else {
    urgencyLevel = "unsafe";
    urgencyColor = "#dc2626";
    urgencyBorderClass = "border-l-4 border-red-500";
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  const remainingText =
    remainingMs <= 0
      ? "Expired"
      : hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${seconds}s`;

  return {
    remainingMs,
    remainingText,
    percentage,
    urgencyLevel,
    urgencyColor,
    urgencyBorderClass,
  };
}
