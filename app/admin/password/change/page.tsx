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

export default function SettingsPage() {
  const router = useRouter();
  
  // 비밀번호 상태
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // SMS 커스텀 메시지 상태
  const [smsCustomMessage, setSmsCustomMessage] = useState("예약일에 만나요! :)");
  
  // 다국어 설정 상태
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.ok && data.settings) {
        // SMS 커스텀 메시지 로드
        if (data.settings.smsCustomMessage) {
          setSmsCustomMessage(data.settings.smsCustomMessage);
        }
        
        // 다국어 설정 로드
        if (data.settings.languages) {
          const savedLanguages =
            typeof data.settings.languages === "string"
              ? JSON.parse(data.settings.languages)
              : data.settings.languages;
          setLanguages(savedLanguages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("❌ 모든 필드를 입력해주세요");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ 비밀번호가 일치하지 않습니다");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword.length < 4) {
      setMessage("❌ 비밀번호는 최소 4자 이상이어야 합니다");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "password",
          value: newPassword,
        }),
      });

      if (response.ok) {
        setMessage("✅ 비밀번호가 변경되었습니다");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ 비밀번호 변경에 실패했습니다");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage("❌ 비밀번호 변경 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSmsMessageSave = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "smsCustomMessage",
          value: smsCustomMessage,
        }),
      });

      if (response.ok) {
        setMessage("✅ SMS 메시지가 저장되었습니다");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ 저장에 실패했습니다");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save SMS message:", error);
      setMessage("❌ 저장 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSave = async () => {
    setLoading(true);

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

  const handleToggleLanguage = (lang: "ko" | "en" | "ja" | "zh") => {
    setLanguages((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        enabled: !prev[lang].enabled,
      },
    }));
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
          <h1 className="text-lg font-bold text-gray-900">비밀번호 변경 및 기타 설정</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content pb-20">
        <div className="max-w-[640px] mx-auto space-y-8">
          
          {/* 1. 비밀번호 변경 섹션 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">비밀번호 변경</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  새 비밀번호 <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  비밀번호 확인 <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                ℹ️ 비밀번호는 최소 4자 이상이어야 합니다
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-auto px-6 h-8 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors disabled:bg-gray-300"
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </div>
            </div>
          </div>

          {/* 2. 다국어 설정 섹션 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">다국어 설정</h2>
            <p className="text-sm text-gray-500 mb-6">활성화할 언어를 선택하세요</p>
            <div className="space-y-4 mb-6">
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

            <div className="flex justify-center">
              <button
                onClick={handleLanguageSave}
                disabled={loading}
                className="w-auto px-6 h-8 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors disabled:bg-gray-300"
              >
                {loading ? "저장 중..." : "언어 설정 저장"}
              </button>
            </div>
          </div>

          {/* 3. 확정문자 추가 안내사항 섹션 */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">확정문자 추가 안내사항</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  SMS 추가 메시지
                </label>
                <textarea
                  value={smsCustomMessage}
                  onChange={(e) => setSmsCustomMessage(e.target.value)}
                  placeholder="예약 확정 문자에 포함될 추가 메시지를 입력하세요&#10;예) 예약일에 만나요! :)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSmsMessageSave}
                  disabled={loading}
                  className="w-auto px-6 h-8 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors disabled:bg-gray-300"
                >
                  {loading ? "저장 중..." : "SMS 메시지 저장"}
                </button>
              </div>
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
    </div>
  );
}
