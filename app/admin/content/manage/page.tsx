"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageUploader from "@/components/admin/ImageUploader";

interface Benefit {
  number: number;
  title: string;
  description: string;
}

interface ConsentDetail {
  title: string;
  subtitle: string;
  body: string;
}

interface ContentSettings {
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formPageTitle: string;
  formTitle: string;
  heroImageUrls: string[];
  profileImageUrl: string;
  businessRegistrationImageUrl: string;
  benefits: Benefit[];
  consentDetails: ConsentDetail[];
  smsCustomMessage: string;
  statsLoadingText: string;
  statsTemplate: string;
}

export default function ContentManagePage() {
  const router = useRouter();
  const { languageContent } = useLanguage();
  const [settings, setSettings] = useState<ContentSettings>({
    mainTitle: "포토부스 체험단 모집",
    mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
    applicationItem: "포토부스 렌탈",
    companyName: "포토그루브",
    ctaButtonText: "지금 신청하기",    formPageTitle: "포토부스 렌탈 신청",    formTitle: "신청이 완료 되었어요",
    heroImageUrls: [],
    profileImageUrl: "",
    smsCustomMessage: "예약일에 만나요! :)",
    businessRegistrationImageUrl: "",
    statsLoadingText: "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)",
    statsTemplate: "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )",
    benefits: [
      {
        number: 1,
        title: "렌탈 실비 20만원 (4H)",
        description: "선입금 금지, 행사 종료 후 정산",
      },
      {
        number: 2,
        title: "운송비 등 추가비용 X",
        description: "인화지 500장 지원, 전문 인력 현장 배치",
      },
    ],
    consentDetails: [
      {
        title: "개인정보 수집 및 이용 안내",
        subtitle: "개인정보 수집 및 이용 안내",
        body: "1. 수집 항목\n- 이름, 연락처(전화번호), 지역, 문의 내용\n\n2. 수집·이용 목적\n- 포토그루브 프로그램 설치 및 렌탈 상담\n- 문의 내용 확인 및 상담 안내 연락\n\n3. 보유 및 이용 기간\n- 문의 접수일로부터 1년 이내 (목적 달성 시 즉시 파기)\n\n4. 동의 거부 권리 및 불이익\n- 동의를 거부할 수 있으나, 거부 시 상담/문의 접수가 제한될 수 있습니다.",
      },
      {
        title: "개인정보 제3자 제공 안내",
        subtitle: "개인정보 제3자 제공 안내",
        body: "- 메타페이는 이용자의 개인정보를 제3자에게 제공하지 않습니다.\n- 단, 법령에 따라 제출 의무가 발생하는 경우에는 예외적으로 제공될 수 있습니다.",
      },
      {
        title: "개인정보 처리방침 요약",
        subtitle: "개인정보 처리방침 요약",
        body: "- 개인정보는 상담 목적을 위해서만 이용됩니다.\n- 보관 기간 경과 또는 목적 달성 시 지체 없이 파기합니다.\n- 개인정보 보호 관련 문의: kiwankoo@gmail.com",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (languageContent && !isReady) {
      setIsReady(true);
    }
  }, [languageContent, isReady]);

  // 언어가 바뀔 때마다 settings를 해당 언어 값으로 동기화
  useEffect(() => {
    if (languageContent) {
      setSettings((prev) => ({
        ...prev,
        mainTitle: languageContent.mainTitle || prev.mainTitle,
        mainSubtitle: languageContent.mainSubtitle || prev.mainSubtitle,
        applicationItem: languageContent.applicationItem || prev.applicationItem,
        companyName: languageContent.companyName || prev.companyName,
        ctaButtonText: languageContent.ctaButtonText || prev.ctaButtonText,
        formPageTitle: languageContent.formPageTitle || prev.formPageTitle,
        formTitle: languageContent.formTitle || prev.formTitle,
        benefits: Array.isArray(languageContent.benefits)
          ? languageContent.benefits.map((b, i) => ({
              number: prev.benefits[i]?.number ?? i + 1,
              title: b.title,
              description: b.description,
            }))
          : prev.benefits,
        consentDetails: Array.isArray(languageContent.consentDetails)
          ? languageContent.consentDetails
          : prev.consentDetails,
        statsLoadingText: languageContent.statsLoadingText || prev.statsLoadingText,
        statsTemplate: languageContent.statsTemplate || prev.statsTemplate,
      }));
    }
  }, [languageContent]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.ok && data.settings) {
        // languages 객체에서 한국어 콘텐츠 추출
        const koContent = data.settings.languages?.ko?.content || {};
        
        const newSettings: ContentSettings = {
          mainTitle: koContent.mainTitle || settings.mainTitle,
          mainSubtitle: koContent.mainSubtitle || settings.mainSubtitle,
          applicationItem: koContent.applicationItem || settings.applicationItem,
          companyName: koContent.companyName || settings.companyName,
          ctaButtonText: koContent.ctaButtonText || settings.ctaButtonText,
          formPageTitle: koContent.formPageTitle || settings.formPageTitle,
          formTitle: koContent.formTitle || settings.formTitle,
          heroImageUrls: Array.isArray(data.settings.heroImageUrls)
            ? data.settings.heroImageUrls
            : [],
          profileImageUrl: data.settings.profileImageUrl || "",
          benefits: Array.isArray(koContent.benefits)
            ? koContent.benefits
            : settings.benefits,
          consentDetails: Array.isArray(koContent.consentDetails)
            ? koContent.consentDetails
            : settings.consentDetails,
          smsCustomMessage: data.settings.smsCustomMessage || settings.smsCustomMessage,
          businessRegistrationImageUrl: data.settings.businessRegistrationImageUrl || "",
          statsLoadingText: koContent.statsLoadingText || settings.statsLoadingText,
          statsTemplate: koContent.statsTemplate || settings.statsTemplate,
        };
        setSettings(newSettings);
        console.log("[ContentManage] Loaded settings from languages:", koContent);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBenefitChange = (index: number, field: string, value: string) => {
    const newBenefits = [...settings.benefits];
    newBenefits[index] = {
      ...newBenefits[index],
      [field]: value,
    };
    setSettings((prev) => ({
      ...prev,
      benefits: newBenefits,
    }));
  };

  const handleConsentDetailChange = (index: number, field: string, value: string) => {
    const newConsentDetails = [...settings.consentDetails];
    newConsentDetails[index] = {
      ...newConsentDetails[index],
      [field]: value,
    };
    setSettings((prev) => ({
      ...prev,
      consentDetails: newConsentDetails,
    }));
  };

  const addBenefit = () => {
    const newNumber =
      Math.max(...settings.benefits.map((b) => b.number), 0) + 1;
    setSettings((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          number: newNumber,
          title: "새로운 혜택",
          description: "설명을 입력하세요",
        },
      ],
    }));
  };

  const removeBenefit = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("번역 중...");

    try {
      // Always use auto-detect for source language and translate to all target languages
      const baseContent = {
        mainTitle: settings.mainTitle,
        mainSubtitle: settings.mainSubtitle,
        applicationItem: settings.applicationItem,
        companyName: settings.companyName,
        ctaButtonText: settings.ctaButtonText,
        formPageTitle: settings.formPageTitle,
        formTitle: settings.formTitle,
        benefits: settings.benefits.map(b => ({ title: b.title, description: b.description })),
        consentDetails: settings.consentDetails.map(d => ({
          title: d.title,
          subtitle: d.subtitle,
          body: d.body,
        })),
        statsLoadingText: settings.statsLoadingText,
        statsTemplate: settings.statsTemplate,
      };

      // 2. 번역할 텍스트 배열 (순서대로)
      const baseTexts = [
        baseContent.mainTitle,
        baseContent.mainSubtitle,
        baseContent.applicationItem,
        baseContent.companyName,
        baseContent.ctaButtonText,
        baseContent.formPageTitle,
        baseContent.formTitle,
      ];
      const benefitTexts = baseContent.benefits.flatMap(b => [b.title, b.description]);
      const consentTexts = baseContent.consentDetails.flatMap(d => [d.title, d.subtitle, d.body]);
      const textsToTranslate = [...baseTexts, ...benefitTexts, ...consentTexts];

      // 3. Google Cloud Translation API로 번역 (auto-detect → ko, en, ja, zh)
      const translateText = async (text: string, targetLang: string) => {
        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
          if (!apiKey) {
            console.warn("Google Translate API 키가 없습니다. 원본 텍스트를 반환합니다.");
            return text;
          }
          // zh-CN만 Google API에 맞게 zh로 변환
          const lang = targetLang === "zh-CN" ? "zh" : targetLang;
          const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: text,
                target: lang,
                format: "text"
              }),
            }
          );
          const data = await response.json();
          if (!response.ok || data.error) {
            console.error("Google Translate API 오류:", data);
            return text;
          }
          return data.data?.translations?.[0]?.translatedText || text;
        } catch (err) {
          console.error(`번역 실패: [${text}] → ${targetLang}:`, err);
          return text;
        }
      };

      // 4. 모든 언어로 번역 (항상 ko, en, ja, zh 모두 번역)
      const langCodes = ["ko", "en", "ja", "zh-CN"];
      const langMap = { ko: "ko", en: "en", ja: "ja", zh: "zh-CN" };
      const translatedTexts: Record<string, string[]> = {};
      for (const lang of langCodes) {
        translatedTexts[lang] = await Promise.all(textsToTranslate.map(t => translateText(t, lang)));
      }

      // 5. 번역된 텍스트로 콘텐츠 객체 생성
      const benefitsStartIndex = baseTexts.length;
      const consentStartIndex = benefitsStartIndex + baseContent.benefits.length * 2;
      const defaultStatsTemplates = {
        ko: "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )",
        en: "{count1} applicants in the last month ( Total {count2} )",
        ja: "最近1ヶ月間{count1}名申請中 ( 累計{count2}名 )",
        zh: "最近一个月{count1}人申请中 ( 累计{count2}人 )",
      };
      const defaultStatsLoadingTexts = {
        ko: "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)",
        en: "Loading applicant count... (Please wait if many users online)",
        ja: "申請者数を読み込み中... (同時接続者が多い場合は時間がかかります)",
        zh: "正在加载申请人数... (同时在线用户较多时可能需要一些时间)",
      };
      const createLanguageContent = (texts: string[], lang: "ko" | "en" | "ja" | "zh") => {
        const benefits = baseContent.benefits.map((_, i) => ({
          title: texts[benefitsStartIndex + i * 2],
          description: texts[benefitsStartIndex + i * 2 + 1],
        }));
        const consentDetails = baseContent.consentDetails.map((_, i) => ({
          title: texts[consentStartIndex + i * 3],
          subtitle: texts[consentStartIndex + i * 3 + 1],
          body: texts[consentStartIndex + i * 3 + 2],
        }));
        return {
          mainTitle: texts[0],
          mainSubtitle: texts[1],
          applicationItem: texts[2],
          companyName: texts[3],
          ctaButtonText: texts[4],
          formPageTitle: texts[5],
          formTitle: texts[6],
          statsLoadingText: defaultStatsLoadingTexts[lang],
          statsTemplate: defaultStatsTemplates[lang],
          benefits,
          consentDetails,
        };
      };

      // 6. 기존 languages 설정 불러오기 (활성화 상태 유지)
      let existingLanguages = null;
      try {
        const existingResponse = await fetch("/api/admin/settings");
        const existingData = await existingResponse.json();
        existingLanguages = existingData.settings?.languages;
      } catch (err) {
        console.warn("[ContentManage] Failed to load existing languages:", err);
      }

      // 7. 기존의 enabled 상태를 유지하면서 content만 업데이트
      const languages = {
        ko: {
          enabled: existingLanguages?.ko?.enabled ?? true,
          content: createLanguageContent(translatedTexts["ko"], "ko"),
        },
        en: {
          enabled: existingLanguages?.en?.enabled ?? false,
          content: createLanguageContent(translatedTexts["en"], "en"),
        },
        ja: {
          enabled: existingLanguages?.ja?.enabled ?? false,
          content: createLanguageContent(translatedTexts["ja"], "ja"),
        },
        zh: {
          enabled: existingLanguages?.zh?.enabled ?? false,
          content: createLanguageContent(translatedTexts["zh-CN"], "zh"),
        },
      };

      setMessage("저장 중...");

      // 8. 이미지와 languages를 한 번에 저장
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "languagesAndImages",
          value: {
            languages,
            heroImageUrls: settings.heroImageUrls,
            profileImageUrl: settings.profileImageUrl,
            businessRegistrationImageUrl: settings.businessRegistrationImageUrl,
            smsCustomMessage: settings.smsCustomMessage,
          },
        }),
      });
            <ImageUploader
              title={languageContent?.businessRegistrationLabel || "사업자등록증 이미지 (1개)"}
              maxFiles={1}
              maxSizePerFile={5}
              onUpload={async (urls) => {
                setSettings((prev) => ({
                  ...prev,
                  businessRegistrationImageUrl: urls[0] || "",
                }));
                // 업로드 후 즉시 저장
                await fetch("/api/admin/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    key: "businessRegistrationImageUrl",
                    value: urls[0] || "",
                  }),
                });
              }}
            />

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // BroadcastChannel로 다른 탭(사용자 페이지)에 알림
      try {
        const channel = new BroadcastChannel("language-settings-channel");
        channel.postMessage({ type: "language-updated" });
        channel.close();
        console.log("[ContentManage] BroadcastChannel message sent");
      } catch (broadcastError) {
        console.warn("[ContentManage] BroadcastChannel not supported:", broadcastError);
        // 폴백: localStorage 이벤트
        localStorage.setItem("admin-settings-updated", Date.now().toString());
      }

      setMessage("✅ 설정이 저장되었습니다 (번역 완료)");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ 저장 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
      console.error(err);
    } finally {
      setLoading(false);
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
          <h1 className="text-lg font-bold text-gray-900">{languageContent?.contentPageTitle || "메인 콘텐츠 수정"}</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content">
        {!isReady ? (
          <div className="max-w-[640px] mx-auto p-4 text-center">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : (
          <div className="max-w-[640px] mx-auto space-y-6">
            {/* 메인 섹션 */}
            <div className="space-y-5">
              <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.mainPageSection || "메인 페이지"}</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.mainTitleLabel || "메인 제목"} <span className="text-[#7c3aed]">*</span>
              </label>
              <input
                type="text"
                value={settings.mainTitle}
                onChange={(e) => handleChange("mainTitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.subTitleLabel || "서브 제목"}
              </label>
              <input
                type="text"
                value={settings.mainSubtitle}
                onChange={(e) => handleChange("mainSubtitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          {/* 고정 콘텐츠 섹션 (관리자 수정 불가) */}
          <div className="space-y-5 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg" style={{ display: 'none' }}>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.fixedContentLabel || "기정 콘테냈 (수정 불가 - 자동 번역됨)"}</h3>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{languageContent?.readOnlyBadge || "읽기전용"}</span>
            </div>
            <p className="text-[13px] text-gray-600">{languageContent?.fixedContentDesc || "아래의 콘테냈는 모든 언어로 자동 번역되지만 관리자가 수정할 수 없습니다."}</p>

            <div className="bg-white p-3 rounded border border-gray-200">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">{languageContent?.adminLoginTextLabel || "관리자 로그인 텍스트"}</label>
              <div className="text-[13px] text-gray-600 p-2 bg-gray-100 rounded">{languageContent?.adminLogin || "관리자 로그인"}</div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">신청자 수 로딩 텍스트</label>
              <div className="text-[13px] text-gray-600 p-2 bg-gray-100 rounded">{languageContent?.statsLoadingText || "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)"}</div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">신청자 수 템플릿</label>
              <div className="text-[13px] text-gray-600 p-2 bg-gray-100 rounded">최근 한달간 {'{count1}'}명 신청 중 ( 누적 {'{count2}'}명 )</div>
            </div>

            {/* 사업자등록증 텍스트 블록 완전 제거 (업로드 섹션만 남김) */}

            <div className="bg-white p-3 rounded border border-gray-200">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">{languageContent?.formPageTextsLabel || "폰 페이지 텍스트들"}</label>
              <div className="text-[13px] text-gray-600 space-y-1 p-2 bg-gray-100 rounded">
                <div>신청 정보 입력 페이지</div>
                <div>이름, 연락처 입력 필드</div>
                <div>예약 날짜/시간 선택 페이지</div>
                <div>개인정보 동의 모달</div>
                <div>신청 완료 페이지</div>
              </div>
            </div>
          </div>

          {/* 메인 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.imageManagementLabel || "이미지 관리"}</h3>

            <ImageUploader
              title={languageContent?.heroImagesLabel || "히어로 스라이더 이미지 (최대 20개)"}
              maxFiles={20}
              maxSizePerFile={5}
              onUpload={async (urls) => {
                setSettings((prev) => ({
                  ...prev,
                  heroImageUrls: urls,
                }));
                // 업로드 후 즉시 저장
                await fetch("/api/admin/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    key: "heroImageUrls",
                    value: urls,
                  }),
                });
              }}
            />

            <ImageUploader
              title={languageContent?.profileImageLabel || "프로필 이미지 (1개)"}
              maxFiles={1}
              maxSizePerFile={5}
              onUpload={async (urls) => {
                setSettings((prev) => ({
                  ...prev,
                  profileImageUrl: urls[0] || "",
                }));
                // 업로드 후 즉시 저장
                await fetch("/api/admin/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    key: "profileImageUrl",
                    value: urls[0] || "",
                  }),
                });
              }}
            />

            <div className="pt-2">
              <ImageUploader
                title={languageContent?.businessRegistrationLabel || "사업자등록증 이미지 (1개)"}
                maxFiles={1}
                maxSizePerFile={5}
                onUpload={async (urls) => {
                  setSettings((prev) => ({
                    ...prev,
                    businessRegistrationImageUrl: urls[0] || "",
                  }));
                  // 업로드 후 즉시 저장
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: "businessRegistrationImageUrl",
                      value: urls[0] || "",
                    }),
                  });
                }}
              />
            </div>
          </div>

          {/* 신청 정보 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.applicationInfoLabel || "신청 정보"}</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.applicationItemField || "신청 항목"}
              </label>
              <input
                type="text"
                value={settings.applicationItem}
                onChange={(e) => handleChange("applicationItem", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.companyNameField || "상호명"}
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          {/* 버튼 텍스트 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.buttonTextsLabel || "버튼 & 문구"}</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.ctaButtonLabel || "하단 CTA 버튼"}
              </label>
              <input
                type="text"
                value={settings.ctaButtonText}
                onChange={(e) => handleChange("ctaButtonText", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.formPageTitleLabel || "폰 페이지 제목"}
              </label>
              <input
                type="text"
                value={settings.formPageTitle}
                onChange={(e) => handleChange("formPageTitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.completionPageTitleLabel || "완료 패지 제목"}
              </label>
              <input
                type="text"
                value={settings.formTitle}
                onChange={(e) => handleChange("formTitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div style={{ display: 'none' }}>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.smsAdditionalLabel || "SMS 추가 메시지"}
              </label>
              <textarea
                value={settings.smsCustomMessage}
                onChange={(e) => handleChange("smsCustomMessage", e.target.value)}
                placeholder={languageContent?.smsMessagePlaceholderText || "예약 확정 문자에 포함될 추가 메시지를 입력하세요\n예) 당일 연락주세요: 010-1234-5678"}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {languageContent?.smsMessageHintText || "예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요."}
              </p>
            </div>

            <div style={{ display: 'none' }}>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.statsLoadingLabel || "통계 로딩 텍스트"}
              </label>
              <input
                type="text"
                value={settings.statsLoadingText}
                onChange={(e) => handleChange("statsLoadingText", e.target.value)}
                placeholder="신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div style={{ display: 'none' }}>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                {languageContent?.statsTemplateLabel || "통계 텍스트 템플릿"}
              </label>
              <input
                type="text"
                value={settings.statsTemplate}
                onChange={(e) => handleChange("statsTemplate", e.target.value)}
                placeholder="최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
              <p className="mt-1 text-xs text-gray-500">
                {languageContent?.placeholderNote || "{count1}과 {count2}는 실제 숫자로 자동 대체됩니다."}
              </p>
            </div>
          </div>

          {/* 개인정보 동의 항목 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.consentDetailsTitle || "개인정보 동의 항목"}</h3>
            <p className="text-[13px] text-gray-600">
              {languageContent?.consentDetailsDesc || "체크박스 제목/설명과 상세 동의 내용을 수정합니다. 모든 언어로 자동 번역됩니다."}
            </p>

            <div className="space-y-4">
              {settings.consentDetails.map((detail, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-semibold text-gray-900">
                      {languageContent?.consentItemLabel || "항목"} {index + 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={detail.title}
                      onChange={(e) =>
                        handleConsentDetailChange(index, "title", e.target.value)
                      }
                      placeholder={languageContent?.consentTitlePlaceholder || "제목"}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                    <input
                      type="text"
                      value={detail.subtitle}
                      onChange={(e) =>
                        handleConsentDetailChange(index, "subtitle", e.target.value)
                      }
                      placeholder={languageContent?.consentSubtitlePlaceholder || "부제목"}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                    <textarea
                      value={detail.body}
                      onChange={(e) =>
                        handleConsentDetailChange(index, "body", e.target.value)
                      }
                      placeholder={languageContent?.consentBodyPlaceholder || "상세 내용"}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 혜택 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-gray-900">{languageContent?.benefitsLabel || "협쿇 항목"}</h3>
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 cursor-pointer"
              >
                {languageContent?.addBenefitButton || "+ 추가"}
              </button>
            </div>

            <div className="space-y-4">
              {settings.benefits.map((benefit, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-semibold text-gray-900">
                      {languageContent?.benefitItemLabel || "항목"} {benefit.number}
                    </span>
                    {settings.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold cursor-pointer"
                      >
                        {languageContent?.deleteBenefitButton || "삭제"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={benefit.title}
                      onChange={(e) =>
                        handleBenefitChange(index, "title", e.target.value)
                      }
                      placeholder={languageContent?.benefitTitlePlaceholder || "제목"}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                    <textarea
                      value={benefit.description}
                      onChange={(e) =>
                        handleBenefitChange(index, "description", e.target.value)
                      }
                      placeholder={languageContent?.benefitDescriptionPlaceholder || "설명"}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className="p-4 bg-purple-50 rounded-lg text-center text-sm">
              {message}
            </div>
          )}
          </div>
        )}
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
              {loading ? (languageContent?.savingButton || "저장 중...") : (languageContent?.saveButton || "저장")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
