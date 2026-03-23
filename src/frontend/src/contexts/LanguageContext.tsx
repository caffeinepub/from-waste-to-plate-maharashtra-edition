import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { type TranslationKey, translations } from "../locales/translations";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("language") as Language) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
    } catch {}
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let current: unknown = translations[language];
    for (const k of keys) {
      if (
        current &&
        typeof current === "object" &&
        k in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        let fallback: unknown = translations.en;
        for (const fk of keys) {
          if (
            fallback &&
            typeof fallback === "object" &&
            fk in (fallback as Record<string, unknown>)
          ) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else {
            return key;
          }
        }
        return typeof fallback === "string" ? fallback : key;
      }
    }
    return typeof current === "string" ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export type { Language, TranslationKey };
