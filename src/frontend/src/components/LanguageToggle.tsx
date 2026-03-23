import React from "react";
import { type Language, useLanguage } from "../contexts/LanguageContext";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "mr", label: "MR" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
            language === code
              ? "bg-brand-green text-white"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
