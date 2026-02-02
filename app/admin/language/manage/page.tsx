"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/lead-flow/ConsentSheet.module.css";

interface LanguageContent {
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formTitle: string;
}

interface LanguageSettings {
  enabled: boolean;
  content: LanguageContent;
}

interface AllLanguages {
  ko: LanguageSettings;
  en: LanguageSettings;
  ja: LanguageSettings;
  zh: LanguageSettings;
}

export default function LanguageManagePage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<AllLanguages>({
    ko: {
      enabled: true,
      content: {
        mainTitle: "포토부스 체험단 모집",
        mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
        applicationItem: "포토부스 렌탈",
        companyName: "포토그루브",
        ctaButtonText: "지금 신청하기",
        formTitle: "신청이 완료 되었어요",
      },
    },
    en: {
      enabled: false,
      content: {
        mainTitle: "Photo Booth Experience Program",
        mainSubtitle: "Hot response, 4-cut photo booth rental",
        applicationItem: "Photo Booth Rental",
        companyName: "PhotoGroove",
        ctaButtonText: "Apply Now",
        formTitle: "Application Complete",
      },
    },
    ja: {
      enabled: false,
      content: {
        mainTitle: "フォトブース体験団募集",
        mainSubtitle: "熱い反応、4カット写真ブースレンタル",
        applicationItem: "フォトブースレンタル",
        companyName: "フォトグルーブ",
        ctaButtonText: "今すぐ申し込む",
        formTitle: "申請完了",
      },
    },
    zh: {
      enabled: false,
      content: {
        mainTitle: "照相亭体验团招募",
        mainSubtitle: "热烈反响，四格照片摄影棚租赁",
        applicationItem: "照相亭租赁",
        companyName: "PhotoGroove",
        ctaButtonText: "立即申请",
        formTitle: "申请完成",
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.ok && data.settings?.languages) {
        const savedLanguages =
          typeof data.settings.languages === "string"
            ? JSON.parse(data.settings.languages)
            : data.settings.languages;
        setLanguages(savedLanguages);
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  const handleToggleLanguage = (lang: "ko" | "en" | "ja" | "zh") => {
    setLanguages((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        enabled: !prev[lang].enabled,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "languages",
          value: languages,
        }),
      });

      if (response.ok) {
        setMessage("✅ 언어 설정이 저장되었습니다");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ 저장에 실패했습니다");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save languages:", error);
      setMessage("❌ 저장 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const languageNames = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 English",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 text-gray-900 hover:text-gray-600"
            aria-label="뒤로가기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">다국어 설정</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content">
        <div className="max-w-[640px] mx-auto">
          {/* 언어 활성화 섹션 */}
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">
              활성화할 언어 선택
            </h2>
            <div className="space-y-4">
              {(["ko", "en", "ja", "zh"] as const).map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={languages[lang].enabled}
                    onChange={() => handleToggleLanguage(lang)}
                    disabled={lang === "ko"}
                    className="sr-only"
                  />
                  <span
                    className={`${styles.checkboxBox} ${languages[lang].enabled ? styles.checkboxChecked : ""}`}
                    aria-hidden
                  >
                    <svg
                      className={`${styles.checkIcon} ${languages[lang].enabled ? "opacity-100" : "opacity-0"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[15px] font-medium text-gray-900">
                    {languageNames[lang]}
                    {lang === "ko" && <span className="text-xs text-gray-500 ml-2">(기본)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center text-sm">
              {message}
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10">
        <div className="px-4 py-3">
          <div className="max-w-[640px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 rounded-[12px] bg-[#7c3aed] text-base font-bold text-white hover:bg-[#6d28d9] transition-colors active:scale-[0.98] disabled:bg-gray-300"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
