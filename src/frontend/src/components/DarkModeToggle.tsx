import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
