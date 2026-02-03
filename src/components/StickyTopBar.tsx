"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StickyTopBarProps {
  maxWidthClass?: string;
  isAdminPage?: boolean;
}

export default function StickyTopBar({ maxWidthClass = "lg:max-w-[1100px]", isAdminPage = false }: StickyTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsVisible(y > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdminLogin = () => {
    router.push("/admin/schedule");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const languageNames = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 EN",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-200 lg:flex lg:justify-center lg:border-gray-100 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        height: "calc(56px + env(safe-area-inset-top))",
      }}
    >
      <div className={`flex items-center h-14 w-full ${maxWidthClass}`}>
        <div className="px-4 w-full">
          <div className="max-w-[640px] mx-auto h-full flex items-center justify-between">
            {/* 왼쪽: 뒤로가기 또는 관리자 로그인 */}
            {isAdminPage ? (
              <button
                onClick={handleAdminLogin}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="관리자 로그인"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-semibold">관리자 로그인</span>
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 cursor-pointer"
                aria-label="뒤로가기"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* 오른쪽: 언어 선택 드롭다운 */}
            {availableLanguages && (
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-[12px] font-semibold text-gray-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {languageNames[lang]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
