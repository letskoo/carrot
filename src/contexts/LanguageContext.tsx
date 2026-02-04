"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ko" | "en" | "ja" | "zh";

type LanguageContent = {
  // 관리자가 수정 가능한 콘텐츠 (활성화)
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formTitle: string;
  benefits?: Array<{ title: string; description: string }>;
  // 관리자가 수정 불가능한 콘텐츠 (비활성화 - 고정값)
  adminLogin?: string;
  statsLoadingText?: string;
  statsTemplate?: string;
  businessRegistrationText?: string;
  // 폼 페이지
  formPageTitle?: string;
  formPageSubtitle?: string;
  nameInputLabel?: string;
  phoneInputLabel?: string;
  formSubmitButtonText?: string;
  // 예약 페이지
  bookingPageTitle?: string;
  dateSelectionTitle?: string;
  timeSelectionTitle?: string;
  // 동의 모달
  consentTitle?: string;
  consentAgree?: string;
  consentDisagree?: string;
  // 완료 페이지
  completionTitle?: string;
  completionMessage?: string;
};

type LanguageSettings = {
  enabled?: boolean;
  content?: LanguageContent;
};

type AllLanguages = {
  [key in Language]: LanguageSettings;
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  languageContent: LanguageContent | null;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// 기본값 languages 객체
const DEFAULT_LANGUAGES: AllLanguages = {
  ko: {
    enabled: true,
    content: {
      // 관리자 수정 가능
      mainTitle: "포토부스 체험단 모집",
      mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
      applicationItem: "포토부스 렌탈",
      companyName: "포토그루브",
      ctaButtonText: "지금 신청하기",
      formTitle: "신청이 완료 되었어요",
      benefits: [
        { title: "렌탈 실비 20만원 (4H)", description: "선입금 금지, 행사 종료 후 정산" },
        { title: "운송비 등 추가비용 X", description: "인화지 500장 지원, 전문 인력 현장 배치" },
      ],
      // 관리자 수정 불가 (고정값)
      adminLogin: "관리자 로그인",
      statsLoadingText: "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)",
      statsTemplate: "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )",
      businessRegistrationText: "사업자등록증 보기",
      formPageTitle: "신청 정보 입력",
      formPageSubtitle: "개인정보를 입력해주세요",
      nameInputLabel: "이름",
      phoneInputLabel: "연락처",
      formSubmitButtonText: "다음 단계",
      bookingPageTitle: "예약 날짜 선택",
      dateSelectionTitle: "날짜를 선택해주세요",
      timeSelectionTitle: "시간을 선택해주세요",
      consentTitle: "개인정보 수집 동의",
      consentAgree: "동의합니다",
      consentDisagree: "동의하지 않습니다",
      completionTitle: "신청이 완료 되었어요",
      completionMessage: "감사합니다!",
    },
  },
  en: {
    enabled: false,
    content: {
      // 관리자 수정 가능
      mainTitle: "Photo Booth Experience Program",
      mainSubtitle: "Hot response, 4-cut photo booth rental",
      applicationItem: "Photo Booth Rental",
      companyName: "PhotoGroove",
      ctaButtonText: "Apply Now",
      formTitle: "Application Complete",
      benefits: [
        { title: "Rental fee $200 (4H)", description: "No prepayment, settlement after event" },
        { title: "No additional costs like shipping", description: "500 sheets of photo paper provided, professional staff on site" },
      ],
      // 관리자 수정 불가 (고정값)
      adminLogin: "Admin Login",
      statsLoadingText: "Loading applicant count... (Please wait if many users online)",
      statsTemplate: "{count1} applicants in the last month ( Total {count2} )",
      businessRegistrationText: "View Business Registration",
      formPageTitle: "Enter Application Information",
      formPageSubtitle: "Please enter your personal information",
      nameInputLabel: "Name",
      phoneInputLabel: "Phone Number",
      formSubmitButtonText: "Next",
      bookingPageTitle: "Select Booking Date",
      dateSelectionTitle: "Please select a date",
      timeSelectionTitle: "Please select a time",
      consentTitle: "Personal Information Collection Consent",
      consentAgree: "I Agree",
      consentDisagree: "I Disagree",
      completionTitle: "Application Complete",
      completionMessage: "Thank you!",
    },
  },
  ja: {
    enabled: false,
    content: {
      // 管理者編集可能
      mainTitle: "フォトブース体験団募集",
      mainSubtitle: "熱い反応、4カット写真ブースレンタル",
      applicationItem: "フォトブースレンタル",
      companyName: "フォトグルーブ",
      ctaButtonText: "今すぐ申し込む",
      formTitle: "申請完了",
      benefits: [
        { title: "レンタル実費20万円(4時間)", description: "先払い禁止、イベント終了後に精算" },
        { title: "運送費など追加費用X", description: "写真紙500枚提供、専門スタッフ現場配置" },
      ],
      // 管理者編集不可 (固定値)
      adminLogin: "管理者ログイン",
      statsLoadingText: "申請者数を読み込み中... (同時接続者が多い場合は時間がかかります)",
      statsTemplate: "最近1ヶ月間{count1}名申請中 ( 累計{count2}名 )",
      businessRegistrationText: "事業者登録証を見る",
      formPageTitle: "申請情報入力",
      formPageSubtitle: "個人情報を入力してください",
      nameInputLabel: "お名前",
      phoneInputLabel: "連絡先",
      formSubmitButtonText: "次へ",
      bookingPageTitle: "予約日時を選択",
      dateSelectionTitle: "日付を選択してください",
      timeSelectionTitle: "時間を選択してください",
      consentTitle: "個人情報収集に同意",
      consentAgree: "同意します",
      consentDisagree: "同意しません",
      completionTitle: "申請完了",
      completionMessage: "ありがとうございました!",
    },
  },
  zh: {
    enabled: false,
    content: {
      // 管理员可编辑
      mainTitle: "照相亭体验团招募",
      mainSubtitle: "热烈反响，四格照片摄影棚租赁",
      applicationItem: "照相亭租赁",
      companyName: "PhotoGroove",
      ctaButtonText: "立即申请",
      formTitle: "申请完成",
      benefits: [
        { title: "租赁实费20万元(4小时)", description: "禁止预付款，活动结束后结算" },
        { title: "无运费等追加费用X", description: "提供500张照片纸，现场配置专业人员" },
      ],
      // 管理员不可编辑 (固定值)
      adminLogin: "管理员登录",
      statsLoadingText: "正在加载申请人数... (同时在线用户较多时可能需要一些时间)",
      statsTemplate: "最近一个月{count1}人申请中 ( 累计{count2}人 )",
      businessRegistrationText: "查看营业执照",
      formPageTitle: "输入申请信息",
      formPageSubtitle: "请输入您的个人信息",
      nameInputLabel: "姓名",
      phoneInputLabel: "联系电话",
      formSubmitButtonText: "下一步",
      bookingPageTitle: "选择预约日期",
      dateSelectionTitle: "请选择日期",
      timeSelectionTitle: "请选择时间",
      consentTitle: "个人信息收集同意书",
      consentAgree: "我同意",
      consentDisagree: "我不同意",
      completionTitle: "申请完成",
      completionMessage: "谢谢!",
    },
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("ko");
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([
    "ko",
  ]);
  const [allLanguageContent, setAllLanguageContent] = useState<AllLanguages | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 로드 + BroadcastChannel + storage event 감지
  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        console.log("[LanguageContext] Admin settings loaded");
        console.log("[LanguageContext] data.ok:", data.ok);
        console.log("[LanguageContext] data.settings exists:", !!data.settings);
        console.log("[LanguageContext] data.settings.languages:", data.settings?.languages);

        let languagesToUse = DEFAULT_LANGUAGES;

        if (data.ok && data.settings?.languages) {
          try {
            const savedLanguages: AllLanguages =
              typeof data.settings.languages === "string"
                ? JSON.parse(data.settings.languages)
                : data.settings.languages;

            console.log("[LanguageContext] Parsed languages from Sheets:", savedLanguages);
            
            // Google Sheets 데이터와 DEFAULT_LANGUAGES 병합
            // Google Sheets에 없는 필드는 DEFAULT_LANGUAGES에서 가져옴
            if (savedLanguages && typeof savedLanguages === "object") {
              const mergedLanguages: AllLanguages = {} as AllLanguages;
              
              for (const lang of ["ko", "en", "ja", "zh"] as Language[]) {
                mergedLanguages[lang] = {
                  enabled: savedLanguages[lang]?.enabled ?? DEFAULT_LANGUAGES[lang]?.enabled ?? false,
                  content: {
                    ...DEFAULT_LANGUAGES[lang]?.content,  // 기본값 먼저
                    ...savedLanguages[lang]?.content,      // Google Sheets 값으로 덮어쓰기
                  },
                };
              }
              
              languagesToUse = mergedLanguages;
              console.log("[LanguageContext] ✅ Merged with defaults, ko.content keys:", Object.keys(mergedLanguages.ko.content));
            }
          } catch (parseError) {
            console.error("[LanguageContext] Failed to parse languages, using defaults:", parseError);
            languagesToUse = DEFAULT_LANGUAGES;
          }
        } else {
          console.log("[LanguageContext] No languages in Sheets, using defaults");
          languagesToUse = DEFAULT_LANGUAGES;
        }

        // 전체 언어 데이터 저장
        setAllLanguageContent(languagesToUse);
        console.log("[LanguageContext] ✅ setAllLanguageContent called with:", Object.keys(languagesToUse));
        console.log("[LanguageContext] ✅ languagesToUse.ko.content:", languagesToUse.ko?.content);

        // 활성화된 언어만 추출
        const enabled = Object.entries(languagesToUse || {})
          .filter(([, value]) => value?.enabled)
          .map(([key]) => key)
          .filter((key): key is Language =>
            ["ko", "en", "ja", "zh"].includes(key)
          );

        // 항상 'ko' 포함, 중복 제거
        const unique = Array.from(
          new Set<Language>(["ko", ...enabled])
        );

        console.log("[LanguageContext] Available languages:", unique);
        setAvailableLanguages(unique);
      } catch (error) {
        console.error("[LanguageContext] Failed to load languages:", error);
        // 에러 시에도 기본값 사용
        setAllLanguageContent(DEFAULT_LANGUAGES);
        setAvailableLanguages(["ko"]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();

    // BroadcastChannel로 모든 탭에서 즉시 동기화
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("language-settings-channel");
      const handleBroadcast = (event: MessageEvent) => {
        if (event.data.type === "language-updated") {
          console.log(
            "[LanguageContext] BroadcastChannel received language update"
          );
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

  // 현재 언어의 content 추출
  const languageContent = (allLanguageContent || DEFAULT_LANGUAGES)?.[currentLanguage]?.content || null;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages,
        languageContent,
        isLoading,
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
