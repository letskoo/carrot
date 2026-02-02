"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ko" | "en" | "ja" | "zh";

type LanguageSettingsMap = Record<string, { enabled?: boolean }>;

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  setAvailableLanguages: (langs: Language[]) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ko");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([
    "ko",
  ]);

  useEffect(() => {
    const loadAvailableLanguages = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        if (data.ok && data.settings?.languages) {
          const savedLanguages: LanguageSettingsMap =
            typeof data.settings.languages === "string"
              ? (JSON.parse(data.settings.languages) as LanguageSettingsMap)
              : (data.settings.languages as LanguageSettingsMap);

          const enabled = Object.entries(savedLanguages || {})
            .filter(([, value]) => value?.enabled)
            .map(([key]) => key) as Language[];

          const unique = Array.from(new Set(["ko", ...enabled]));
          setAvailableLanguages(unique);
          return;
        }
      } catch (error) {
        console.error("Failed to load available languages:", error);
      }

      setAvailableLanguages(["ko"]);
    };

    loadAvailableLanguages();
  }, []);

  useEffect(() => {
    // 로컬 스토리지에서 언어 설정 불러오기
    const savedLang = localStorage.getItem("user_language") as Language;
    if (savedLang && availableLanguages.includes(savedLang)) {
      setCurrentLanguage(savedLang);
    }
  }, [availableLanguages]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem("user_language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages,
        setAvailableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
