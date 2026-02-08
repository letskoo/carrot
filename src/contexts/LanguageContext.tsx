"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type Language = "ko" | "en" | "ja" | "zh";

type LanguageContent = {
        defaultLanguageSection?: string;
      defaultLanguageDesc?: string;
    defaultLabel?: string;
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
  consentRequiredLabel?: string;
  // 관리자 로그인 페이지
  adminPasswordPlaceholder?: string;
  adminLoginButton?: string;
  adminLoggingInButton?: string;
  adminBackButton?: string;
  adminDashboard?: string;
  adminLogout?: string;
  // 관리자 메뉴
  scheduleSettingsTitle?: string;
  scheduleSettingsDesc?: string;
  scheduleSettingsButton?: string;
  mainContentTitle?: string;
  mainContentDesc?: string;
  mainContentButton?: string;
  passwordSettingsTitle?: string;
  passwordSettingsDesc?: string;
  passwordSettingsButton?: string;
  // 예약 일정 설정 페이지
  schedulePageTitle?: string;
  bulkScheduleTitle?: string;
  startDateLabel?: string;
  endDateLabel?: string;
  weekdaySettingsTitle?: string;
  weekendSettingsTitle?: string;
  maxBookingsLabel?: string;
  availableTimesLabel?: string;
  generateScheduleButton?: string;
  generatingScheduleButton?: string;
  previousMonth?: string;
  nextMonth?: string;
  // 메인 콘텐츠 수정 페이지
  contentPageTitle?: string;
  mainPageSection?: string;
  mainTitleLabel?: string;
  subTitleLabel?: string;
  saveButton?: string;
  savingButton?: string;
  // 비밀번호 변경 페이지
  passwordPageTitle?: string;
  passwordChangeSection?: string;
  newPasswordLabel?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  changePasswordButton?: string;
  languageSettingsSection?: string;
  languageSettingsDesc?: string;
  smsSettingsSection?: string;
  passwordMinLengthMessage?: string;
  smsMessageLabel?: string;
  smsMessagePlaceholder?: string;
  smsMessageHint?: string;
  saveSmsButton?: string;
  savingSmsButton?: string;
  existingSchedulesLabel?: string;
  selectDeleteButton?: string;
  deleteConfirmMessage?: string;
  deletedMessage?: string;
  deleteErrorMessage?: string;
  enableSlotConfirmMessage?: string;
  enabledSlotMessage?: string;
  enableSlotErrorMessage?: string;
  disableSlotConfirmMessage?: string;
  disabledSlotMessage?: string;
  disableSlotErrorMessage?: string;
  disableAllSlotsConfirmMessage?: string;
  disabledAllSlotMessage?: string;
  skippedCountMessage?: string;
  errorCountMessage?: string;
  cancelledLabel?: string;
  bookingStatusTitle?: string;
  noBookingsLabel?: string;
  confirmedLabel?: string;
  waitingLabel?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  deleteButtonLabel?: string;
  disableAllButtonLabel?: string;
  disableSelectedButtonLabel?: string;
  imageManagementLabel?: string;
  heroImagesLabel?: string;
  profileImageLabel?: string;
  applicationInfoLabel?: string;
  applicationItemField?: string;
  companyNameField?: string;
  buttonTextsLabel?: string;
  ctaButtonLabel?: string;
  formPageTitleLabel?: string;
  completionPageTitleLabel?: string;
  smsAdditionalLabel?: string;
  statsLoadingLabel?: string;
  statsTemplateLabel?: string;
  fixedContentLabel?: string;
  readOnlyBadge?: string;
  fixedContentDesc?: string;
  adminLoginTextLabel?: string;
  formPageTextsLabel?: string;
  businessRegistrationLabel?: string;
  consentDetailsTitle?: string;
  consentDetailsDesc?: string;
  consentItemLabel?: string;
  consentTitlePlaceholder?: string;
  consentSubtitlePlaceholder?: string;
  consentBodyPlaceholder?: string;
  benefitsLabel?: string;
  addBenefitButton?: string;
  deleteBenefitButton?: string;
  benefitItemLabel?: string;
  benefitTitlePlaceholder?: string;
  benefitDescriptionPlaceholder?: string;
  placeholderNote?: string;
  smsMessagePlaceholderText?: string;
  smsMessageHintText?: string;
  smsSavedMessage?: string;
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
  defaultLanguage: Language;
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
      // 관리자 메뉴
      scheduleSettingsTitle: "예약 일정 설정",
      scheduleSettingsDesc: "대량으로 예약 가능 일정을 생성합니다",
      scheduleSettingsButton: "일정 설정하기 →",
      mainContentTitle: "메인 콘텐츠 수정",
      mainContentDesc: "제목, 소제목, 혜택 항목 등을 수정합니다",
      mainContentButton: "콘텐츠 수정하기 →",
      passwordSettingsTitle: "비밀번호 변경 및 기타 설정",
      passwordSettingsDesc: "비밀번호, 다국어, SMS 안내사항을 설정합니다",
      passwordSettingsButton: "설정하기 →",
      // 예약 일정 설정 페이지
      schedulePageTitle: "예약 일정 설정",
      bulkScheduleTitle: "대량 일정 생성",
      startDateLabel: "시작일",
      endDateLabel: "종료일",
      weekdaySettingsTitle: "평일 설정",
      weekendSettingsTitle: "주말 설정",
      maxBookingsLabel: "최대 예약 수",
      availableTimesLabel: "예약 가능 시간 (쉼표로 구분)",
      generateScheduleButton: "일정 생성",
      generatingScheduleButton: "생성 중...",
      previousMonth: "이전",
      nextMonth: "다음",
      // 메인 콘텐츠 수정 페이지
      contentPageTitle: "메인 콘텐츠 수정",
      mainPageSection: "메인 페이지",
      mainTitleLabel: "메인 제목",
      subTitleLabel: "서브 제목",
      saveButton: "저장",
        savingButton: "저장 중...",
      // 비밀번호 변경 페이지
      passwordPageTitle: "비밀번호 변경 및 기타 설정",
      passwordChangeSection: "비밀번호 변경",
      newPasswordLabel: "새 비밀번호",
      newPasswordPlaceholder: "새 비밀번호를 입력하세요",
      confirmPasswordLabel: "비밀번호 확인",
      confirmPasswordPlaceholder: "비밀번호를 다시 입력하세요",
      changePasswordButton: "비밀번호 변경",
      passwordMinLengthMessage: "비밀번호는 최소 4자 이상이어야 합니다",
        // savingButton already defined above
      defaultLanguageDesc: "사용자가 처음 페이지에 접속할 때 표시할 기본 언어를 선택하세요",
      defaultLanguageSection: "기본 언어 설정",
      languageSettingsSection: "다국어 설정",
      languageSettingsDesc: "활성화할 언어를 선택하세요",
      smsSettingsSection: "확정문자 추가 안내사항",
      smsMessageLabel: "SMS 추가 메시지",
      smsMessagePlaceholder: "예약 확정 문자에 포함될 추가 메시지를 입력하세요\n예) 예약일에 만나요! :)",
      smsMessageHint: "예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요.",
      saveSmsButton: "SMS 메시지 저장",
      savingSmsButton: "저장 중...",
      smsSavedMessage: "✅ SMS 메시지가 저장되었습니다",
        // defaultLabel already defined above
      existingSchedulesLabel: "기존 일정",
      selectDeleteButton: "선택 삭제",
      deleteConfirmMessage: "선택한 {count}개의 일정을 삭제하시겠습니까?",
      deletedMessage: "✅ 선택한 일정이 삭제되었습니다",
      deleteErrorMessage: "❌ 삭제 중 오류가 발생했습니다",
      enableSlotConfirmMessage: "{time} 시간대를 다시 활성화하시겠습니까?",
      enabledSlotMessage: "✅ 시간대가 활성화되었습니다",
      enableSlotErrorMessage: "❌ 시간대 활성화 중 오류가 발생했습니다",
      disableSlotConfirmMessage: "{time} 시간대를 비활성화하시겠습니까?\n\n비활성화하면 더 이상 예약을 받을 수 없습니다.",
      disabledSlotMessage: "✅ 시간대가 비활성화되었습니다",
      disableSlotErrorMessage: "❌ 시간대 비활성화 중 오류가 발생했습니다",
      disableAllSlotsConfirmMessage: "{date}의 모든 시간대를 비활성화하시겠습니까?\n\n확정/대기 예약이 있는 시간대는 건너뜁니다.",
      disabledAllSlotMessage: "✅ {count}개 시간대가 비활성화되었습니다",
      skippedCountMessage: "⚠️ {count}개 시간대는 예약이 있어 건너뛰었습니다",
      errorCountMessage: "❌ {count}개 시간대 처리 중 오류 발생",
      cancelledLabel: "취소됨",
      bookingStatusTitle: "{time} 예약 현황",
      noBookingsLabel: "예약이 없습니다",
      confirmedLabel: "확정",
      waitingLabel: "대기",
      confirmButtonLabel: "확정",
      cancelButtonLabel: "취소",
      deleteButtonLabel: "삭제",
      disableAllButtonLabel: "전체 취소",
      disableSelectedButtonLabel: "선택 취소",
      imageManagementLabel: "이미지 관리",
      heroImagesLabel: "히어로 슬라이더 이미지 (최대 20개)",
      profileImageLabel: "프로필 이미지 (1개)",
      applicationInfoLabel: "신청 정보",
      applicationItemField: "신청 항목",
      companyNameField: "상호명",
      buttonTextsLabel: "버튼 & 문구",
      ctaButtonLabel: "하단 CTA 버튼",
      formPageTitleLabel: "폼 페이지 제목",
      completionPageTitleLabel: "완료 페이지 제목",
      smsAdditionalLabel: "SMS 추가 메시지",
      statsLoadingLabel: "통계 로딩 텍스트",
      statsTemplateLabel: "통계 텍스트 템플릿",
      fixedContentLabel: "고정 콘텐츠 (수정 불가 - 자동 번역됨)",
      readOnlyBadge: "읽기전용",
      fixedContentDesc: "아래의 콘텐츠는 모든 언어로 자동 번역되지만 관리자가 수정할 수 없습니다.",
      adminLoginTextLabel: "관리자 로그인 텍스트",
      formPageTextsLabel: "폼 페이지 텍스트들",
      businessRegistrationLabel: "사업자등록증 보기 텍스트",
      consentDetailsTitle: "개인정보 동의 항목",
      consentDetailsDesc: "체크박스 제목/설명과 상세 동의 내용을 수정합니다. 모든 언어로 자동 번역됩니다.",
      consentItemLabel: "항목",
      consentTitlePlaceholder: "제목",
      consentSubtitlePlaceholder: "부제목",
      consentBodyPlaceholder: "상세 내용",
      benefitsLabel: "혜택 항목",
      addBenefitButton: "+ 추가",
      deleteBenefitButton: "삭제",
      benefitItemLabel: "항목",
      benefitTitlePlaceholder: "제목",
      benefitDescriptionPlaceholder: "설명",
      placeholderNote: "{count1}과 {count2}는 실제 숫자로 자동 대체됩니다.",
      smsMessagePlaceholderText: "예약 확정 문자에 포함될 추가 메시지를 입력하세요\n예) 당일 연락주세요: 010-1234-5678",
      smsMessageHintText: "예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요.",
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
      consentRequiredLabel: "(필수)",
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
      adminLogout: "Logout",      // Admin Menu
      scheduleSettingsTitle: "Schedule Settings",
      scheduleSettingsDesc: "Create bulk booking availability schedules",
      scheduleSettingsButton: "Configure Schedule →",
      mainContentTitle: "Edit Main Content",
      mainContentDesc: "Edit titles, subtitles, benefits, and more",
      mainContentButton: "Edit Content →",
      passwordSettingsTitle: "Password & Settings",
      passwordSettingsDesc: "Configure password, languages, SMS messages",
      passwordSettingsButton: "Settings →",
      // Schedule Settings Page
      schedulePageTitle: "Schedule Settings",
      bulkScheduleTitle: "Bulk Schedule Generation",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      weekdaySettingsTitle: "Weekday Settings",
      weekendSettingsTitle: "Weekend Settings",
      maxBookingsLabel: "Max Bookings",
      availableTimesLabel: "Available Times (comma separated)",
      generateScheduleButton: "Generate Schedule",
      generatingScheduleButton: "Generating...",
      previousMonth: "Previous",
      nextMonth: "Next",
      // Content Management Page
      contentPageTitle: "Edit Main Content",
      mainPageSection: "Main Page",
      mainTitleLabel: "Main Title",
      subTitleLabel: "Subtitle",
      saveButton: "Save",
        savingButton: "Saving...",
      // Password Change Page
      passwordPageTitle: "Password & Settings",
      passwordChangeSection: "Change Password",
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "Enter new password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Re-enter password",
      changePasswordButton: "Change Password",
      passwordMinLengthMessage: "Password must be at least 4 characters.",
        // savingButton already defined above
      defaultLanguageDesc: "Select the default language to display when a user first visits the page.",
      defaultLanguageSection: "Default Language Setting",
      languageSettingsSection: "Language Settings",
      languageSettingsDesc: "Select which languages to enable",
      smsSettingsSection: "SMS Additional Message",
      smsMessageLabel: "SMS Additional Message",
      smsMessagePlaceholder: "Enter an additional message to include in the booking confirmation text\nExample) Please contact on the booking day: 010-1234-5678",
      smsMessageHint: "Displayed below the booker, date, and time information. Enter additional information such as contact and address.",
      saveSmsButton: "Save SMS Message",
      savingSmsButton: "Saving...",
      smsSavedMessage: "✅ SMS message has been saved.",
      defaultLabel: "(Default)",
      existingSchedulesLabel: "Existing Schedules",
      selectDeleteButton: "Delete Selected",
      deleteConfirmMessage: "Delete {count} selected schedule(s)?",
      deletedMessage: "✅ Selected schedules deleted",
      deleteErrorMessage: "❌ Error deleting schedules",
      enableSlotConfirmMessage: "Re-enable {time}?",
      enabledSlotMessage: "✅ Time slot enabled",
      enableSlotErrorMessage: "❌ Error enabling time slot",
      disableSlotConfirmMessage: "Disable {time}?\n\nDisabling stops accepting bookings for this time.",
      disabledSlotMessage: "✅ Time slot disabled",
      disableSlotErrorMessage: "❌ Error disabling time slot",
      disableAllSlotsConfirmMessage: "Disable all time slots for {date}?\n\nTime slots with confirmed/pending bookings will be skipped.",
      disabledAllSlotMessage: "✅ {count} time slots disabled",
      skippedCountMessage: "⚠️ {count} time slots skipped (have bookings)",
      errorCountMessage: "❌ Error processing {count} time slots",
      cancelledLabel: "Cancelled",
      bookingStatusTitle: "{time} Bookings",
      noBookingsLabel: "No bookings",
      confirmedLabel: "Confirmed",
      waitingLabel: "Waiting",
      confirmButtonLabel: "Confirm",
      cancelButtonLabel: "Cancel",
      deleteButtonLabel: "Delete",
      disableAllButtonLabel: "Disable All",
      disableSelectedButtonLabel: "Disable Selected",
      imageManagementLabel: "Image Management",
      heroImagesLabel: "Hero Slider Images (Max 20)",
      profileImageLabel: "Profile Image (1 required)",
      applicationInfoLabel: "Application Information",
      applicationItemField: "Application Item",
      companyNameField: "Company Name",
      buttonTextsLabel: "Button & Text",
      ctaButtonLabel: "Bottom CTA Button",
      formPageTitleLabel: "Form Page Title",
      completionPageTitleLabel: "Completion Page Title",
      smsAdditionalLabel: "SMS Additional Message",
          // defaultLabel already defined above
      statsTemplateLabel: "Statistics Text Template",
      fixedContentLabel: "Fixed Content (Read-only - Auto-translated)",
      readOnlyBadge: "Read-only",
      fixedContentDesc: "The content below is auto-translated to all languages but cannot be edited by admin.",
      adminLoginTextLabel: "Admin Login Text",
      formPageTextsLabel: "Form Page Texts",
      businessRegistrationLabel: "Business Registration Text",
      consentDetailsTitle: "Personal Information Consent Items",
      consentDetailsDesc: "Edit checkbox title/description and detailed consent content. Automatically translated to all languages.",
      consentItemLabel: "Item",
      consentTitlePlaceholder: "Title",
      consentSubtitlePlaceholder: "Subtitle",
      consentBodyPlaceholder: "Detailed content",
      benefitsLabel: "Benefits",
      addBenefitButton: "+ Add",
      deleteBenefitButton: "Delete",
      benefitItemLabel: "Item",
      benefitTitlePlaceholder: "Title",
      benefitDescriptionPlaceholder: "Description",
      placeholderNote: "{count1} and {count2} are automatically replaced with actual numbers.",
      smsMessagePlaceholderText: "Enter an additional message to include in the booking confirmation text\nExample) Please contact on the booking day: 010-1234-5678",
      smsMessageHintText: "Displayed below the booker, date, and time information. Enter additional information such as contact and address.",
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
      consentRequiredLabel: "(Required)",
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
      adminLogout: "ログアウト",
      // 管理メニュー
      scheduleSettingsTitle: "スケジュール設定",
      scheduleSettingsDesc: "一括で予約可能なスケジュールを作成します",
      scheduleSettingsButton: "スケジュール設定 →",
      mainContentTitle: "メインコンテンツ編集",
      mainContentDesc: "タイトル、サブタイトル、特典項目などを編集します",
      mainContentButton: "コンテンツ編集 →",
      passwordSettingsTitle: "パスワードと設定",
      passwordSettingsDesc: "パスワード、言語、SMS案内を設定します",
      passwordSettingsButton: "設定 →",
      // スケジュール設定ページ
      schedulePageTitle: "スケジュール設定",
      bulkScheduleTitle: "一括スケジュール作成",
      startDateLabel: "開始日",
      endDateLabel: "終了日",
      weekdaySettingsTitle: "平日設定",
      weekendSettingsTitle: "週末設定",
      maxBookingsLabel: "最大予約数",
      availableTimesLabel: "予約可能時間（カンマ区切り）",
      generateScheduleButton: "スケジュール作成",
      generatingScheduleButton: "作成中...",
      previousMonth: "前",
      nextMonth: "次",
      // コンテンツ管理ページ
      contentPageTitle: "メインコンテンツ編集",
      mainPageSection: "メインページ",
      mainTitleLabel: "メインタイトル",
      subTitleLabel: "サブタイトル",
      saveButton: "保存",
        savingButton: "保存中...",
      // パスワード変更ページ
      passwordPageTitle: "パスワードと設定",
      passwordChangeSection: "パスワード変更",
      newPasswordLabel: "新しいパスワード",
      newPasswordPlaceholder: "新しいパスワードを入力",
      confirmPasswordLabel: "パスワード確認",
      confirmPasswordPlaceholder: "パスワードを再入力",
      changePasswordButton: "パスワード変更",
      passwordMinLengthMessage: "パスワードは4文字以上である必要があります。",
        // savingButton already defined above
      defaultLanguageDesc: "ユーザーが最初にページにアクセスしたときに表示するデフォルト言語を選択してください。",
      defaultLanguageSection: "基本言語設定",
      languageSettingsSection: "多言語設定",
      languageSettingsDesc: "有効にする言語を選択してください",
      smsSettingsSection: "SMS追加メッセージ",
      smsMessageLabel: "SMS追加メッセージ",
      smsMessagePlaceholder: "予約確定メッセージに含めるための追加メッセージを入力してください\n例）予約当日にご連絡ください: 010-1234-5678",
      smsMessageHint: "予約者、日付、時間情報の下に表示されます。連絡先、住所など追加情報を入力してください。",
      saveSmsButton: "SMSメッセージを保存",
      savingSmsButton: "保存中...",
      smsSavedMessage: "✅ SMSメッセージが保存されました。",
      defaultLabel: "(デフォルト)",
      existingSchedulesLabel: "既存スケジュール",
      selectDeleteButton: "選択削除",
      deleteConfirmMessage: "選択した{count}個のスケジュールを削除しますか？",
          // defaultLabel already defined above
      deleteErrorMessage: "❌ スケジュール削除中にエラーが発生しました",
      enableSlotConfirmMessage: "{time}を再度有効にしますか？",
      enabledSlotMessage: "✅ タイムスロットが有効になりました",
      enableSlotErrorMessage: "❌ タイムスロット有効化中にエラーが発生しました",
      disableSlotConfirmMessage: "{time}を無効にしますか？\n\n無効にすると、このタイムスロットの予約を受け付けなくなります。",
      disabledSlotMessage: "✅ タイムスロットが無効になりました",
      disableSlotErrorMessage: "❌ タイムスロット無効化中にエラーが発生しました",
      disableAllSlotsConfirmMessage: "{date}のすべてのタイムスロットを無効にしますか？\n\n確定/待機予約があるタイムスロットはスキップされます。",
      disabledAllSlotMessage: "✅ {count}個のタイムスロットが無効になりました",
      skippedCountMessage: "⚠️ {count}個のタイムスロットはスキップされました（予約があります）",
      errorCountMessage: "❌ {count}個のタイムスロット処理中にエラーが発生しました",
      cancelledLabel: "キャンセル済み",
      bookingStatusTitle: "{time}の予約",
      noBookingsLabel: "予約がありません",
      confirmedLabel: "確定",
      waitingLabel: "待機中",
      confirmButtonLabel: "確定",
      cancelButtonLabel: "キャンセル",
      deleteButtonLabel: "削除",
      disableAllButtonLabel: "すべて無効にする",
      disableSelectedButtonLabel: "選択を無効にする",
      imageManagementLabel: "画像管理",
      heroImagesLabel: "ヒーロースライダー画像（最大20個）",
      profileImageLabel: "プロフィール画像（1個必須）",
      applicationInfoLabel: "申請情報",
      applicationItemField: "申請項目",
      companyNameField: "会社名",
      buttonTextsLabel: "ボタンとテキスト",
      ctaButtonLabel: "下部CTAボタン",
      formPageTitleLabel: "フォームページタイトル",
      completionPageTitleLabel: "完了ページタイトル",
      smsAdditionalLabel: "SMS追加メッセージ",
      statsLoadingLabel: "統計読込テキスト",
      statsTemplateLabel: "統計テキストテンプレート",
      fixedContentLabel: "固定コンテンツ（読み取り専用 - 自動翻訳）",
      readOnlyBadge: "読み取り専用",
      fixedContentDesc: "以下のコンテンツはすべての言語に自動翻訳されていますが、管理者が編集することはできません。",
      adminLoginTextLabel: "管理者ログインテキスト",
      formPageTextsLabel: "フォームページテキスト",
      businessRegistrationLabel: "事業者登録証テキスト",
      consentDetailsTitle: "個人情報同意項目",
      consentDetailsDesc: "チェックボックスのタイトル/説明と詳細な同意内容を編集します。すべての言語に自動翻訳されます。",
      consentItemLabel: "項目",
      consentTitlePlaceholder: "タイトル",
      consentSubtitlePlaceholder: "サブタイトル",
      consentBodyPlaceholder: "詳細内容",
      benefitsLabel: "特典",
      addBenefitButton: "+ 追加",
      deleteBenefitButton: "削除",
      benefitItemLabel: "項目",
      benefitTitlePlaceholder: "タイトル",
      benefitDescriptionPlaceholder: "説明",
      placeholderNote: "{count1}と{count2}は実際の数字に自動置換されます。",
      smsMessagePlaceholderText: "予約確定メッセージに含めるための追加メッセージを入力してください\n例）予約当日にご連絡ください: 010-1234-5678",
      smsMessageHintText: "予約者、日付、時間情報の下に表示されます。連絡先、住所など追加情報を入力してください。",
      statsLoadingText: "申請者数を読み込み中... (同時接続者が多い場合は時間がかかります)",
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
      consentRequiredLabel: "(必須)",
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
      adminLogin: "管理员登录",
      adminPasswordPlaceholder: "请输入密码",
      adminLoginButton: "登录",
      adminLoggingInButton: "登录中...",
      adminBackButton: "返回 →",
      adminDashboard: "管理员仓库",
      adminLogout: "退出登录",
      // 管理菜单
      scheduleSettingsTitle: "日程设置",
      scheduleSettingsDesc: "批量创建可预约日程",
      scheduleSettingsButton: "设置日程 →",
      mainContentTitle: "编辑主要内容",
      mainContentDesc: "编辑标题、副标题、优惠项目等",
      mainContentButton: "编辑内容 →",
      passwordSettingsTitle: "密码和设置",
      passwordSettingsDesc: "配置密码、语言、短信通知",
      passwordSettingsButton: "设置 →",
      // 日程设置页面
      schedulePageTitle: "日程设置",
      bulkScheduleTitle: "批量日程创建",
      startDateLabel: "开始日期",
      endDateLabel: "结束日期",
      weekdaySettingsTitle: "工作日设置",
      weekendSettingsTitle: "周末设置",
      maxBookingsLabel: "最大预约数",
      availableTimesLabel: "可预约时间（逗号分隔）",
      generateScheduleButton: "创建日程",
      generatingScheduleButton: "创建中...",
      previousMonth: "上一页",
      nextMonth: "下一页",
      // 内容管理页面
      contentPageTitle: "编辑主要内容",
      mainPageSection: "主页",
      mainTitleLabel: "主标题",
      subTitleLabel: "副标题",
      saveButton: "保存",
        savingButton: "保存中...",
      // 密码变更页面
      passwordPageTitle: "密码和设置",
      passwordChangeSection: "更改密码",
      newPasswordLabel: "新密码",
      newPasswordPlaceholder: "输入新密码",
      confirmPasswordLabel: "确认密码",
      confirmPasswordPlaceholder: "再次输入密码",
      changePasswordButton: "更改密码",
      passwordMinLengthMessage: "密码至少为4个字符。",
        // savingButton already defined above
      defaultLanguageDesc: "请选择用户首次访问页面时显示的默认语言。",
      defaultLanguageSection: "默认语言设置",
      languageSettingsSection: "多语言设置",
      languageSettingsDesc: "请选择要启用的语言",
      smsSettingsSection: "短信附加消息",
      smsMessageLabel: "短信附加消息",
      smsMessagePlaceholder: "输入要包含在预订确认短信中的附加消息\n例）请在预订当日联系：010-1234-5678",
      smsMessageHint: "显示在预约人员、日期和时间信息下方。输入额外信息，如联系信息和地址。",
      saveSmsButton: "保存短信消息",
      savingSmsButton: "保存中...",
      smsSavedMessage: "✅ 短信消息已保存。",
        // defaultLabel already defined above
      existingSchedulesLabel: "现有日程",
      selectDeleteButton: "删除选定",
      deleteConfirmMessage: "删除选定的{count}个日程？",
      deletedMessage: "✅ 选定的日程已删除",
      deleteErrorMessage: "❌ 删除日程时出错",
      enableSlotConfirmMessage: "重新启用{time}？",
      enabledSlotMessage: "✅ 时间段已启用",
      enableSlotErrorMessage: "❌ 启用时间段时出错",
      disableSlotConfirmMessage: "禁用{time}？\n\n禁用将停止接受此时间段的预订。",
      disabledSlotMessage: "✅ 时间段已禁用",
      disableSlotErrorMessage: "❌ 禁用时间段时出错",
      disableAllSlotsConfirmMessage: "禁用{date}的所有时间段？\n\n具有确认/待查预订的时间段将被跳过。",
      disabledAllSlotMessage: "✅ {count}个时间段已禁用",
      skippedCountMessage: "⚠️ {count}个时间段被跳过（有预订）",
      errorCountMessage: "❌ 处理{count}个时间段时出错",
      cancelledLabel: "已取消",
      bookingStatusTitle: "{time}的预订",
      noBookingsLabel: "无预订",
      confirmedLabel: "已确认",
      waitingLabel: "等待中",
      confirmButtonLabel: "确认",
      cancelButtonLabel: "取消",
      deleteButtonLabel: "删除",
      disableAllButtonLabel: "禁用全部",
      disableSelectedButtonLabel: "禁用选定",
      imageManagementLabel: "图像管理",
      heroImagesLabel: "英雄滑块图像（最多20个）",
      profileImageLabel: "个人资料图像（1个必需）",
      applicationInfoLabel: "申请信息",
      applicationItemField: "申请项目",
      companyNameField: "公司名称",
      buttonTextsLabel: "按钮和文本",
      ctaButtonLabel: "底部CTA按钮",
      formPageTitleLabel: "表单页面标题",
      completionPageTitleLabel: "完成页面标题",
      smsAdditionalLabel: "短信附加消息",
      statsLoadingLabel: "统计加载文本",
      statsTemplateLabel: "统计文本模板",
      fixedContentLabel: "固定内容（只读 - 自动翻译）",
      readOnlyBadge: "只读",
      fixedContentDesc: "以下内容会自动翻译为所有语言，但管理员无法编辑。",
      adminLoginTextLabel: "管理员登录文本",
      formPageTextsLabel: "表单页面文本",
      businessRegistrationLabel: "营业执照文本",
      consentDetailsTitle: "个人信息同意项目",
      consentDetailsDesc: "编辑复选框标题/描述和详细同意内容。自动翻译为所有语言。",
      consentItemLabel: "项目",
      consentTitlePlaceholder: "标题",
      consentSubtitlePlaceholder: "副标题",
      consentBodyPlaceholder: "详细内容",
      benefitsLabel: "福利",
      addBenefitButton: "+ 添加",
      deleteBenefitButton: "删除",
      benefitItemLabel: "项目",
      benefitTitlePlaceholder: "标题",
      benefitDescriptionPlaceholder: "描述",
      placeholderNote: "{count1}和{count2}自动替换为实际数字。",
      smsMessagePlaceholderText: "输入要包含在预订确认短信中的附加消息\n例）请在预订当日联系：010-1234-5678",
      smsMessageHintText: "显示在预约人员、日期和时间信息下方。输入额外信息，如联系信息和地址。",
      statsLoadingText: "正在加载申请人数... (同时在线用户较多时可能需要一些时间)",
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
      consentRequiredLabel: "(必需)",
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
  const [defaultLanguage, setDefaultLanguage] = useState<Language | undefined>(undefined);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language | undefined>(undefined);
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
                  } as LanguageContent,
                };
              }
              
              languagesToUse = mergedLanguages;
              console.log("[LanguageContext] ✅ Merged with defaults, ko.content keys:", Object.keys(mergedLanguages.ko.content || {}));
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

        // 기본 언어 설정 (Google Sheets에서 받아온 값만 사용)
        const savedDefaultLang = data.settings?.defaultLanguage as Language | undefined;
        if (savedDefaultLang && ["ko", "en", "ja", "zh"].includes(savedDefaultLang)) {
          setDefaultLanguage(savedDefaultLang);
        } else {
          setDefaultLanguage(undefined);
        }

        // 활성화된 언어가 없으면 빈 배열
        const unique = Array.from(
          new Set<Language>(enabled.length > 0 ? enabled : [])
        );

        console.log("[LanguageContext] Available languages:", unique);
        console.log("[LanguageContext] Default language:", savedDefaultLang);
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

  // 언어 복원은 언어 데이터가 완전히 로드된 후 1회만!
  const didRestore = useRef(false);
  useEffect(() => {
    if (!isLoading && availableLanguages.length > 0 && defaultLanguage && !didRestore.current) {
      const savedLang = localStorage.getItem("user_language") as Language;
      if (savedLang && availableLanguages.includes(savedLang)) {
        setCurrentLanguage(savedLang);
      } else if (availableLanguages.includes(defaultLanguage)) {
        setCurrentLanguage(defaultLanguage);
      } else {
        setCurrentLanguage(availableLanguages[0]);
      }
      didRestore.current = true;
    }
  }, [isLoading, availableLanguages, defaultLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem("user_language", lang);
  };

  // 현재 언어의 content 추출
    const languageContent =
      currentLanguage !== undefined
        ? (allLanguageContent || DEFAULT_LANGUAGES)[currentLanguage]?.content || null
        : null;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages,
        languageContent,
        isLoading,
        defaultLanguage,
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
