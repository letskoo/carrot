"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "@/components/lead-flow/ConsentSheet.module.css";

interface LanguageContent {
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formTitle: string;
  benefits?: Array<{ title: string; description: string }>;
  statsLoadingText?: string;
  statsTemplate?: string;
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
  const { languageContent } = useLanguage();
  
  // 비밀번호 상태
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 기본 언어 상태
  const [defaultLanguage, setDefaultLanguage] = useState<"ko" | "en" | "ja" | "zh">("ko");
  
  // SMS 커스텀 메시지 상태
  const [smsCustomMessage, setSmsCustomMessage] = useState("예약일에 만나요! :)");
  
  // 다국어 설정 상태
  const [languages, setLanguages] = useState<AllLanguages>({
    ko: {
      enabled: false,
      content: {
        mainTitle: "포토부스 체험단 모집",
        mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
        applicationItem: "포토부스 렌탈",
        companyName: "포토그루브",
        ctaButtonText: "지금 신청하기",
        formTitle: "신청이 완료 되었어요",
        benefits: [
          { title: "가맹비 0원! 24시간 운영 무인카페", description: "초기 비용 최소화 · 자판기 렌탈만으로도 창업 가능!" },
          { title: "렌탈/최장 48개월 분납 지원", description: "일시불 · 분납 · 월 렌탈 선택 가능" },
          { title: "정품 캡슐 사용 / 고수익", description: "브랜드 커피를 24시간 제공" },
        ],
        statsLoadingText: "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)",
        statsTemplate: "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )",
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
        benefits: [
          { title: "No franchise fee! 24/7 unmanned cafe", description: "Minimize initial costs · Start with vending machine rental!" },
          { title: "Rental/Up to 48 months installment", description: "Lump sum · Installment · Monthly rental available" },
          { title: "Authentic capsules / High profit", description: "Provide branded coffee 24 hours" },
        ],
        statsLoadingText: "Loading applicant count... (Please wait if many users online)",
        statsTemplate: "{count1} applicants in the last month ( Total {count2} )",
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
        benefits: [
          { title: "加盟費0円！24時間営業無人カフェ", description: "初期費用最小化・自販機レンタルだけで創業可能！" },
          { title: "レンタル/最長48ヶ月分納支援", description: "一括払い・分納・月レンタル選択可能" },
          { title: "正規カプセル使用 / 高収益", description: "ブランドコーヒーを24時間提供" },
        ],
        statsLoadingText: "申請者数を読み込み中... (同時接続者が多い場合は時間がかかります)",
        statsTemplate: "最近1ヶ月間{count1}名申請中 ( 累計{count2}名 )",
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
        benefits: [
          { title: "加盟费0元！24小时营业无人咖啡馆", description: "最小化初始成本·仅租赁自动售货机即可创业！" },
          { title: "租赁/最长48个月分期支付", description: "一次性付款·分期·月租赁可选" },
          { title: "正品胶囊使用 / 高收益", description: "24小时提供品牌咖啡" },
        ],
        statsLoadingText: "正在加载申请人数... (同时在线用户较多时可能需要一些时间)",
        statsTemplate: "最近一个月{count1}人申请中 ( 累计{count2}人 )",
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
        // 기본 언어 로드
        let currentDefaultLanguage: "ko" | "en" | "ja" | "zh" = "ko";
        if (data.settings.defaultLanguage) {
          currentDefaultLanguage = data.settings.defaultLanguage as "ko" | "en" | "ja" | "zh";
          setDefaultLanguage(currentDefaultLanguage);
        }
        
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
          
          // 기본 언어는 항상 enabled: true로 설정, 나머지는 false
          let needsUpdate = false;
          (Object.keys(savedLanguages) as Array<"ko" | "en" | "ja" | "zh">).forEach((lang) => {
            const shouldBeEnabled = lang === currentDefaultLanguage;
            if (savedLanguages[lang].enabled !== shouldBeEnabled) {
              savedLanguages[lang].enabled = shouldBeEnabled;
              needsUpdate = true;
            }
          });
          
          setLanguages(savedLanguages);

          // 변경사항이 있으면 Google Sheets에 저장
          if (needsUpdate) {
            try {
              await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  key: "languages",
                  value: savedLanguages,
                }),
              });
              console.log("[Admin] Languages synchronized with default language");
            } catch (error) {
              console.error("[Admin] Failed to sync languages:", error);
            }
          }
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

  const handleToggleLanguage = async (lang: "ko" | "en" | "ja" | "zh") => {
    // UI 즉시 업데이트
    const updatedLanguages = {
      ...languages,
      [lang]: {
        ...languages[lang],
        enabled: !languages[lang].enabled,
      },
    };
    setLanguages(updatedLanguages);

    // 즉시 API 저장
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "languages",
          value: updatedLanguages,
        }),
      });

      if (response.ok) {
        console.log(`[Admin] Language ${lang} toggled and saved`);
        
        // BroadcastChannel로 모든 탭에 즉시 알림
        try {
          const channel = new BroadcastChannel("language-settings-channel");
          channel.postMessage({ type: "language-updated" });
          channel.close();
          console.log("[Admin] BroadcastChannel sent language update message");
        } catch (error) {
          console.warn("[Admin] BroadcastChannel not available, using localStorage fallback");
          // 폴백: localStorage 마크 남겨 다른 탭에서 감지하도록
          localStorage.setItem("admin-settings-updated", Date.now().toString());
        }
      } else {
        console.error(`[Admin] Failed to save language ${lang}`);
        // 실패 시 UI 되돌리기
        setLanguages({
          ...languages,
          [lang]: {
            ...languages[lang],
            enabled: !updatedLanguages[lang].enabled,
          },
        });
      }
    } catch (error) {
      console.error("[Admin] Toggle language error:", error);
      // 실패 시 UI 되돌리기
      setLanguages({
        ...languages,
        [lang]: {
          ...languages[lang],
          enabled: !updatedLanguages[lang].enabled,
        },
      });
    }
  };

  const languageNames = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 English",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
  };

  const handleDefaultLanguageChange = async (lang: "ko" | "en" | "ja" | "zh") => {
    setDefaultLanguage(lang);

    // 기본 언어 변경 시 선택한 언어만 활성화, 나머지는 비활성화
    const updatedLanguages = {
      ko: { ...languages.ko, enabled: lang === "ko" },
      en: { ...languages.en, enabled: lang === "en" },
      ja: { ...languages.ja, enabled: lang === "ja" },
      zh: { ...languages.zh, enabled: lang === "zh" },
    };
    setLanguages(updatedLanguages);

    // 즉시 API 저장 - defaultLanguage와 languages 모두 저장
    try {
      // 1. defaultLanguage 저장
      const defaultLangResponse = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "defaultLanguage",
          value: lang,
        }),
      });

      // 2. languages 저장
      const languagesResponse = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "languages",
          value: updatedLanguages,
        }),
      });

      if (defaultLangResponse.ok && languagesResponse.ok) {
        console.log(`[Admin] Default language set to ${lang} and languages synchronized`);
        
        // BroadcastChannel로 모든 탭에 즉시 알림
        try {
          const channel = new BroadcastChannel("language-settings-channel");
          channel.postMessage({ type: "language-updated" });
          channel.close();
        } catch (error) {
          localStorage.setItem("admin-settings-updated", Date.now().toString());
        }
      }
    } catch (error) {
      console.error("[Admin] Failed to save default language:", error);
    }
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
          <h1 className="text-lg font-bold text-gray-900">{languageContent?.passwordPageTitle || "비밀번호 변경 및 기타 설정"}</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content pb-20">
        <div className="max-w-[640px] mx-auto space-y-8">
          
          {/* 1. 비밀번호 변경 섹션 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">{languageContent?.passwordChangeSection || "비밀번호 변경"}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  {languageContent?.newPasswordLabel || "새 비밀번호"} <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={languageContent?.newPasswordPlaceholder || "새 비밀번호를 입력하세요"}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  {languageContent?.confirmPasswordLabel || "비밀번호 확인"} <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={languageContent?.confirmPasswordPlaceholder || "비밀번호를 다시 입력하세요"}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                ℹ️ {languageContent?.passwordMinLengthMessage || "비밀번호는 최소 4자 이상이어야 합니다"}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-auto px-6 h-8 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors disabled:bg-gray-300"
                >
                  {loading ? (languageContent?.savingButton || "변경 중...") : (languageContent?.changePasswordButton || "비밀번호 변경")}
                </button>
              </div>
            </div>
          </div>

          {/* 2. 기본 언어 설정 섹션 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">{languageContent?.defaultLanguageTitle || "기본 언어 설정"}</h2>
            <p className="text-sm text-gray-500 mb-6">{languageContent?.defaultLanguageDesc || "사용자가 처음 페이지에 접속할 때 표시할 기본 언어를 선택하세요"}</p>
            <div className="grid grid-cols-2 gap-3">
              {(["ko", "en", "ja", "zh"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleDefaultLanguageChange(lang)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    defaultLanguage === lang
                      ? "bg-[#7c3aed] text-white ring-2 ring-[#7c3aed]"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 다국어 설정 섹션 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">{languageContent?.languageSettingsSection || "다국어 설정"}</h2>
            <p className="text-sm text-gray-500 mb-6">{languageContent?.languageSettingsDesc || "활성화할 언어를 선택하세요"}</p>
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
                    {lang === defaultLanguage && <span className="text-xs text-gray-500 ml-2">{languageContent?.defaultLabel || "(기본)"}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. 확정문자 추가 안내사항 섹션 */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">{languageContent?.smsSettingsSection || "확정문자 추가 안내사항"}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  {languageContent?.smsMessageLabel || "SMS 추가 메시지"}
                </label>
                <textarea
                  value={smsCustomMessage}
                  onChange={(e) => setSmsCustomMessage(e.target.value)}
                  placeholder={languageContent?.smsMessagePlaceholder || "예약 확정 문자에 포함될 추가 메시지를 입력하세요\n예) 예약일에 만나요! :)"}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {languageContent?.smsMessageHint || "예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요."}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSmsMessageSave}
                  disabled={loading}
                  className="w-auto px-6 h-8 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white hover:bg-[#6d28d9] transition-colors disabled:bg-gray-300"
                >
                  {loading ? (languageContent?.savingSmsButton || "저장 중...") : (languageContent?.saveSmsButton || "SMS 메시지 저장")}
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
