import { AlertTriangle, ShieldOff } from "lucide-react";
import React from "react";
import { useEmergencyMode } from "../contexts/EmergencyModeContext";

export function EmergencyModeToggle() {
  const { isEmergency, toggleEmergency } = useEmergencyMode();

  return (
    <button
      type="button"
      onClick={toggleEmergency}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
        isEmergency
          ? "bg-red-600 text-white animate-pulse-ring hover:bg-red-700"
          : "border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      }`}
    >
      {isEmergency ? (
        <>
          <ShieldOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Deactivate</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency</span>
        </>
      )}
    </button>
  );
}
