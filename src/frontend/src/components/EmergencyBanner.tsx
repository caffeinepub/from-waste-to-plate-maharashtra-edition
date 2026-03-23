import { AlertTriangle } from "lucide-react";
import React from "react";
import { useEmergencyMode } from "../contexts/EmergencyModeContext";

export function EmergencyBanner() {
  const { isEmergency } = useEmergencyMode();

  if (!isEmergency) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-3 animate-emergency">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-bold tracking-wide">
        EMERGENCY MODE ACTIVE – All volunteers are being mobilized
      </span>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
    </div>
  );
}
