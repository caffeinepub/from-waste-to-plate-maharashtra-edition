import { AlertTriangle, ShieldCheck, XCircle } from "lucide-react";
import React from "react";
import type { FoodSafetyResult } from "../utils/foodSafetyEngine";

interface FoodSafetyBadgeProps {
  result: FoodSafetyResult;
  compact?: boolean;
}

export function FoodSafetyBadge({
  result,
  compact = false,
}: FoodSafetyBadgeProps) {
  const icons = {
    safe: <ShieldCheck className="w-4 h-4" />,
    urgent: <AlertTriangle className="w-4 h-4" />,
    unsafe: <XCircle className="w-4 h-4" />,
  };

  const classes = {
    safe: "badge-safe",
    urgent: "badge-urgent",
    unsafe: "badge-unsafe",
  };

  const labels = {
    safe: "Safe",
    urgent: "Urgent",
    unsafe: "Unsafe",
  };

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${classes[result.status]}`}
      >
        {icons[result.status]}
        {labels[result.status]}
      </span>
    );
  }

  return (
    <div className={`rounded-xl p-4 border ${classes[result.status]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icons[result.status]}
        <span className="font-bold text-sm uppercase tracking-wide">
          {labels[result.status]}
        </span>
      </div>
      <p className="font-semibold text-sm">{result.message}</p>
    </div>
  );
}
