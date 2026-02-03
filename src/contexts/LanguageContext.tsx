"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ko" | "en" | "ja" | "zh";

type LanguageSettingsMap = Record<string, { enabled?: boolean }>;

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ko");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([
    "ko",
  ]);

  // 초기 로드 + BroadcastChannel + storage event 감지
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        if (data.ok && data.settings?.languages) {
          const savedLanguages: LanguageSettingsMap =
            typeof data.settings.languages === "string"
              ? JSON.parse(data.settings.languages)
              : data.settings.languages;

          const enabled = Object.entries(savedLanguages || {})
            .filter(([, value]) => value?.enabled)
            .map(([key]) => key)
            .filter((key): key is Language =>
              ["ko", "en", "ja", "zh"].includes(key)
            );

          // 항상 'ko' 포함, 중복 제거
          const unique = Array.from(
            new Set<Language>(["ko", ...enabled])
          );

          console.log("[LanguageContext] Loaded languages:", unique);
          setAvailableLanguages(unique);
        }
      } catch (error) {
        console.error("[LanguageContext] Failed to load languages:", error);
      }
    };

    loadLanguages();

    // BroadcastChannel로 모든 탭에서 즉시 동기화
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("language-settings-channel");
      const handleBroadcast = (event: MessageEvent) => {
        if (event.data.type === "language-updated") {
          console.log("[LanguageContext] BroadcastChannel received language update");
          loadLanguages();
        }
      };
      channel.onmessage = handleBroadcast;
    } catch (error) {
      console.warn("[LanguageContext] BroadcastChannel not supported:", error);
    }

    // 다른 탭에서 admin-settings-updated 변경 감지 (폴백)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-settings-updated") {
        console.log("[LanguageContext] Storage event detected, reloading...");
        loadLanguages();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // 저장된 언어 설정 복원
  useEffect(() => {
    const savedLang = localStorage.getItem("user_language") as Language;
    if (savedLang && availableLanguages.includes(savedLang)) {
      setCurrentLanguage(savedLang);
    } else {
      setCurrentLanguage("ko");
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
