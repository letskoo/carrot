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
  consentDetails?: Array<{
    title: string;
    subtitle: string;
    body: string;
  }>;
  // 관리자가 수정 불가능한 콘텐츠 (비활성화 - 고정값)
  adminLogin?: string;
  statsLoadingText?: string;
  statsTemplate?: string;
  businessRegistrationText?: string;
  applicationItemLabel?: string;
  companyNameLabel?: string;
  // 폼 페이지
  formPageTitle?: string;
  formPageSubtitle?: string;
  nameInputLabel?: string;
  phoneInputLabel?: string;
  formSubmitButtonText?: string;
  // 예약 페이지
  bookingPageTitle?: string;
  bookingPageSubtitle?: string;
  dateSelectionTitle?: string;
  timeSelectionTitle?: string;
  availableTimeLabel?: string;
  cancelButton?: string;
  confirmButton?: string;
  selectedBookingLabel?: string;
  deselectButton?: string;
  loadingText?: string;
  noAvailableSlots?: string;
  availableLegendLabel?: string;
  fullLabel?: string;
  // 동의 모달
  consentTitle?: string;
  consentAllAgree?: string;
  consentAgree?: string;
  consentDisagree?: string;
  // 완료 페이지
  completionTitle?: string;
  completionMessage?: string;
  // 추가 정보 페이지 (Step 3)
  additionalInfoTitle?: string;
  additionalInfoSubtitle?: string;
  regionLabel?: string;
  regionPlaceholder?: string;
  inquiryLabel?: string;
  inquiryPlaceholder?: string;
  applicationSummaryTitle?: string;
  summaryNameLabel?: string;
  summaryPhoneLabel?: string;
  summaryBookingLabel?: string;
  submitApplicationButton?: string;
  // 동의 모달 - 버튼
  agreeAndCompleteButton?: string;
  processingText?: string;
  // 관리자 로그인 페이지
  adminPasswordPlaceholder?: string;
  adminLoginButton?: string;
  adminLoggingInButton?: string;
  adminBackButton?: string;
  adminDashboard?: string;
  adminLogout?: string;
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
      consentDetails: [
        {
          title: "개인정보 수집 및 이용 안내",
          subtitle: "개인정보 수집 및 이용 안내",
          body: "1. 수집 항목\n- 이름, 연락처(전화번호), 지역, 문의 내용\n\n2. 수집·이용 목적\n- 포토그루브 프로그램 설치 및 렌탈 상담\n- 문의 내용 확인 및 상담 안내 연락\n\n3. 보유 및 이용 기간\n- 문의 접수일로부터 1년 이내 (목적 달성 시 즉시 파기)\n\n4. 동의 거부 권리 및 불이익\n- 동의를 거부할 수 있으나, 거부 시 상담/문의 접수가 제한될 수 있습니다."
        },
        {
          title: "개인정보 제3자 제공 안내",
          subtitle: "개인정보 제3자 제공 안내",
          body: "- 메타페이는 이용자의 개인정보를 제3자에게 제공하지 않습니다.\n- 단, 법령에 따라 제출 의무가 발생하는 경우에는 예외적으로 제공될 수 있습니다."
        },
        {
          title: "개인정보 처리방침 요약",
          subtitle: "개인정보 처리방침 요약",
          body: "- 개인정보는 상담 목적을 위해서만 이용됩니다.\n- 보관 기간 경과 또는 목적 달성 시 지체 없이 파기합니다.\n- 개인정보 보호 관련 문의: kiwankoo@gmail.com"
        }
      ],
      // 관리자 수정 불가 (고정값)
      adminLogin: "관리자 로그인",
      adminPasswordPlaceholder: "비밀번호를 입력하세요",
      adminLoginButton: "로그인",
      adminLoggingInButton: "로그인 중...",
      adminBackButton: "돌아가기 →",
      adminDashboard: "관리자 대시보드",
      adminLogout: "로그아웃",
      statsLoadingText: "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)",
      statsTemplate: "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )",
      businessRegistrationText: "사업자등록증 보기",
        applicationItemLabel: "신청항목",
        companyNameLabel: "상호명",
      formPageTitle: "포토부스 렌탈 신청",
      formPageSubtitle: "개인정보를 입력해주세요",
      nameInputLabel: "이름",
      phoneInputLabel: "연락처",
      formSubmitButtonText: "다음 단계",
      bookingPageTitle: "예약 날짜 선택",
      bookingPageSubtitle: "원하시는 날짜를 선택하고 시간을 정해주세요",
      dateSelectionTitle: "날짜를 선택해주세요",
      timeSelectionTitle: "시간을 선택해주세요",
      availableTimeLabel: "예약 가능한 시간을 선택해주세요",
      cancelButton: "취소",
      confirmButton: "확인",
      selectedBookingLabel: "선택한 예약",
      deselectButton: "다시 선택하기",
      loadingText: "로딩 중...",
      noAvailableSlots: "예약 가능한 시간이 없습니다.",
      availableLegendLabel: "예약 가능",
      fullLabel: "마감",
      consentTitle: "신청을 위해 정보 동의를 해주세요",
      consentAllAgree: "모두 동의",
      consentAgree: "동의합니다",
      consentDisagree: "동의하지 않습니다",
      completionTitle: "신청이 완료 되었어요",
      completionMessage: "감사합니다!",
      additionalInfoTitle: "추가 정보",
      additionalInfoSubtitle: "선택사항입니다. 원하시면 작성해주세요.",
      regionLabel: "지역",
      regionPlaceholder: "예: 강남구, 서초구",
      inquiryLabel: "문의 내용",
      inquiryPlaceholder: "행사 종류, 요청사항 등을 자유롭게 작성해주세요",
      applicationSummaryTitle: "신청 정보 확인",
      summaryNameLabel: "이름",
      summaryPhoneLabel: "연락처",
      summaryBookingLabel: "예약",
      submitApplicationButton: "신청 완료하기",
      // 동의 모달 - 버튼
      agreeAndCompleteButton: "동의하고 신청 완료하기",
      processingText: "처리 중…",
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
      consentDetails: [
        {
          title: "Personal Information Collection and Use Guide",
          subtitle: "Personal Information Collection and Use Guide",
          body: "1. Collection Items\n- Name, contact (phone number), region, inquiry content\n\n2. Purpose of Collection and Use\n- Photo Groove program installation and rental consultation\n- Confirmation of inquiry content and consultation guidance contact\n\n3. Retention and Use Period\n- Within 1 year from the date of inquiry receipt (immediately destroyed upon purpose achievement)\n\n4. Right to Refuse Consent and Disadvantages\n- You may refuse consent, but if you refuse, consultation/inquiry submission may be limited."
        },
        {
          title: "Guide to Third-Party Personal Information Disclosure",
          subtitle: "Guide to Third-Party Personal Information Disclosure",
          body: "- Meta Pay does not provide users' personal information to third parties.\n- However, exceptions may apply if disclosure obligations arise under applicable laws."
        },
        {
          title: "Personal Information Protection Policy Summary",
          subtitle: "Personal Information Protection Policy Summary",
          body: "- Personal information is used solely for consultation purposes.\n- Personal information will be destroyed without delay upon expiration of the retention period or achievement of the purpose.\n- For inquiries regarding personal information protection: kiwankoo@gmail.com"
        }
      ],
      // 관리자 수정 불가 (고정값)
      adminLogin: "Admin Login",
      adminPasswordPlaceholder: "Enter password",
      adminLoginButton: "Login",
      adminLoggingInButton: "Logging in...",
      adminBackButton: "Back \u2192",
      adminDashboard: "Admin Dashboard",
      adminLogout: "Logout",
      statsLoadingText: "Loading applicant count... (Please wait if many users online)",
      statsTemplate: "{count1} applicants in the last month ( Total {count2} )",
      businessRegistrationText: "View Business Registration",
        applicationItemLabel: "Application Item",
        companyNameLabel: "Company Name",
      formPageTitle: "Photo Booth Rental Application",
      formPageSubtitle: "Please enter your personal information",
      nameInputLabel: "Name",
      phoneInputLabel: "Phone Number",
      formSubmitButtonText: "Next",
      bookingPageTitle: "Select Booking Date",
      bookingPageSubtitle: "Please select your desired date and time",
      dateSelectionTitle: "Please select a date",
      timeSelectionTitle: "Please select a time",
      availableTimeLabel: "Please select an available time",
      cancelButton: "Cancel",
      confirmButton: "Confirm",
      selectedBookingLabel: "Selected Booking",
      deselectButton: "Deselect",
      loadingText: "Loading...",
      noAvailableSlots: "No available time slots.",
      availableLegendLabel: "Available",
      fullLabel: "Full",
      consentTitle: "Please agree to the information collection for application",
      consentAllAgree: "Agree to All",
      consentAgree: "I Agree",
      consentDisagree: "I Disagree",
      completionTitle: "Application Complete",
      completionMessage: "Thank you!",
      additionalInfoTitle: "Additional Information",
      additionalInfoSubtitle: "Optional. Please fill in if you'd like.",
      regionLabel: "Region",
      regionPlaceholder: "e.g., Gangnam-gu, Seocho-gu",
      inquiryLabel: "Inquiry",
      inquiryPlaceholder: "Please describe your event or requests",
      applicationSummaryTitle: "Application Summary",
      summaryNameLabel: "Name",
      summaryPhoneLabel: "Phone",
      summaryBookingLabel: "Booking",
      submitApplicationButton: "Submit Application",
      // 동의 모달 - 버튼
      agreeAndCompleteButton: "Agree and Complete Application",
      processingText: "Processing…",
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
      adminLogin: "管理者ログイン",      adminPasswordPlaceholder: "パスワードを入力してください",
      adminLoginButton: "ログイン",
      adminLoggingInButton: "ログイン中...",
      adminBackButton: "戻る →",
      adminDashboard: "管理者ダッシュボード",
      adminLogout: "ログアウト",      statsLoadingText: "申請者数を読み込み中... (同時接続者が多い場合は時間がかかります)",
      statsTemplate: "最近1ヶ月間{count1}名申請中 ( 累計{count2}名 )",
      businessRegistrationText: "事業者登録証を見る",
        applicationItemLabel: "申請項目",
        companyNameLabel: "会社名",
      formPageTitle: "フォトブースレンタル申請",
      formPageSubtitle: "個人情報を入力してください",
      nameInputLabel: "お名前",
      phoneInputLabel: "連絡先",
      formSubmitButtonText: "次へ",
      bookingPageTitle: "予約日時を選択",
      bookingPageSubtitle: "ご希望の日付と時間を選択してください",
      dateSelectionTitle: "日付を選択してください",
      timeSelectionTitle: "時間を選択してください",
      availableTimeLabel: "予約可能な時間を選択してください",
      cancelButton: "キャンセル",
      confirmButton: "確認",
      selectedBookingLabel: "選択した予約",
      deselectButton: "選択解除",
      loadingText: "読み込み中...",
      noAvailableSlots: "利用可能な時間がありません。",
      availableLegendLabel: "予約可",
      fullLabel: "満席",
      consentTitle: "申請のための情報収集に同意してください",
      consentAllAgree: "すべてに同意",
      consentAgree: "同意します",
      consentDisagree: "同意しません",
      completionTitle: "申請完了",
      completionMessage: "ありがとうございました!",
      additionalInfoTitle: "追加情報",
      additionalInfoSubtitle: "任意です。必要であればご記入ください。",
      regionLabel: "地域",
      regionPlaceholder: "例: 江南区、瑞草区",
      inquiryLabel: "お問い合わせ内容",
      inquiryPlaceholder: "イベント内容やご要望をご記入ください",
      applicationSummaryTitle: "申請情報の確認",
      summaryNameLabel: "お名前",
      summaryPhoneLabel: "連絡先",
      summaryBookingLabel: "予約",
      submitApplicationButton: "申請を完了する",
      agreeAndCompleteButton: "同意して申請を完了する",
      processingText: "処理中...",
      consentDetails: [
        {
          title: "個人情報の収集および利用案内",
          subtitle: "個人情報処理の目的と範囲",
          body: "1. 収集項目\n- 名前、電話番号\n- 地域、問い合わせ内容\n\n2. 収集目的\n- フォトブース予約確認\n- イベント告知\n- サービス改善\n\n3. 保有期間\n- 1年間保有後削除"
        },
        {
          title: "個人情報の第三者提供案内",
          subtitle: "個人情報共有範囲",
          body: "個人情報は以下の場合のみ第三者に共有されます：\n1. 法的要求による場合\n2. ユーザーの明示的な同意がある場合\n\nその他の目的では共有されません。"
        },
        {
          title: "個人情報処理方針の概要",
          subtitle: "データ保護方針",
          body: "当社は個人情報を安全に管理し、ユーザーの権利を保護します：\n\n1. 暗号化によるデータ保護\n2. 定期的なセキュリティ監査\n3. ユーザーの要求に応じた削除\n\n詳細は個人情報処理方針をご覧ください。"
        }
      ],
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
      adminLogin: "管理员登录",      adminPasswordPlaceholder: "请输入密码",
      adminLoginButton: "登录",
      adminLoggingInButton: "登录中...",
      adminBackButton: "返回 →",
      adminDashboard: "管理员仓库",
      adminLogout: "退出登录",      statsLoadingText: "正在加载申请人数... (同时在线用户较多时可能需要一些时间)",
      statsTemplate: "最近一个月{count1}人申请中 ( 累计{count2}人 )",
      businessRegistrationText: "查看营业执照",
        applicationItemLabel: "申请项目",
        companyNameLabel: "公司名称",
      formPageTitle: "照相亭租赁申请",
      formPageSubtitle: "请输入您的个人信息",
      nameInputLabel: "姓名",
      phoneInputLabel: "联系电话",
      formSubmitButtonText: "下一步",
      bookingPageTitle: "选择预约日期",
      bookingPageSubtitle: "请选择您希望的日期和时间",
      dateSelectionTitle: "请选择日期",
      timeSelectionTitle: "请选择时间",
      availableTimeLabel: "请选择可预约的时间",
      cancelButton: "取消",
      confirmButton: "确认",
      selectedBookingLabel: "选定的预约",
      deselectButton: "取消选择",
      loadingText: "正在加载...",
      noAvailableSlots: "没有可预约的时间。",
      availableLegendLabel: "可预约",
      fullLabel: "已满",
      consentTitle: "请同意为申请收集的信息",
      consentAllAgree: "全部同意",
      consentAgree: "我同意",
      consentDisagree: "我不同意",
      completionTitle: "申请完成",
      completionMessage: "谢谢!",
      additionalInfoTitle: "追加信息",
      additionalInfoSubtitle: "可选项。如需填写请填写。",
      regionLabel: "地区",
      regionPlaceholder: "例如：江南区、瑞草区",
      inquiryLabel: "咨询内容",
      inquiryPlaceholder: "请填写活动类型或需求",
      applicationSummaryTitle: "申请信息确认",
      summaryNameLabel: "姓名",
      summaryPhoneLabel: "联系电话",
      summaryBookingLabel: "预约",
      submitApplicationButton: "完成申请",
      agreeAndCompleteButton: "同意并完成申请",
      processingText: "处理中...",
      consentDetails: [
        {
          title: "个人信息收集及使用说明",
          subtitle: "个人信息处理目的与范围",
          body: "1. 收集项目\n- 姓名、联系电话\n- 地区、咨询内容\n\n2. 收集目的\n- 确认照相亭预约\n- 活动通知\n- 服务改善\n\n3. 保留期限\n- 保留1年后删除"
        },
        {
          title: "个人信息向第三方提供说明",
          subtitle: "个人信息共享范围",
          body: "个人信息仅在以下情况下向第三方共享：\n1. 法律要求时\n2. 用户明确同意时\n\n除此之外不会共享。"
        },
        {
          title: "个人信息处理方针摘要",
          subtitle: "数据保护方针",
          body: "我们会安全管理个人信息并保护用户权利：\n\n1. 通过加密保护数据\n2. 定期安全审计\n3. 根据用户请求删除\n\n详情请参阅个人信息处理方针。"
        }
      ],
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
