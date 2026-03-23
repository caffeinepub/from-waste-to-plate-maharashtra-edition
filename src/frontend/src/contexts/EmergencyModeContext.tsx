import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface EmergencyModeContextType {
  isEmergency: boolean;
  toggleEmergency: () => void;
}

const EmergencyModeContext = createContext<EmergencyModeContextType>({
  isEmergency: false,
  toggleEmergency: () => {},
});

export function EmergencyModeProvider({ children }: { children: ReactNode }) {
  const [isEmergency, setIsEmergency] = useState(() => {
    try {
      return localStorage.getItem("emergencyMode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("emergencyMode", String(isEmergency));
    } catch {}
    if (isEmergency) {
      document.documentElement.classList.add("emergency-mode");
    } else {
      document.documentElement.classList.remove("emergency-mode");
    }
  }, [isEmergency]);

  const toggleEmergency = () => setIsEmergency((prev) => !prev);

  return (
    <EmergencyModeContext.Provider value={{ isEmergency, toggleEmergency }}>
      {children}
    </EmergencyModeContext.Provider>
  );
}

export function useEmergencyMode() {
  return useContext(EmergencyModeContext);
}
