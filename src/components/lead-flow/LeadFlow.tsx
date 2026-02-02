"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useLeadFlow } from "./leadFlowContext";
import StepHeader from "./StepHeader";
import BottomSheetConsent from "./BottomSheetConsent";
import CompleteScreen from "./CompleteScreen";
import BookingCalendar from "./BookingCalendar";
import TimeSlotSheet from "./TimeSlotSheet";
import { FormDataType, ConsentCheckboxes } from "./types";

interface LeadFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadFlow({ isOpen, onClose }: LeadFlowProps) {
  // Context에서 refreshStats 가져오기
  const { refreshStats } = useLeadFlow();

  // ========================================
  // 규칙 A: 모든 hooks를 최상단에 선언 (항상 같은 순서)
  // ========================================

  // 1. useState 그룹
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phone: "",
    region: "",
    memo: "",
    bookingDate: "",
    bookingTime: "",
  });
  const [consentCheckboxes, setConsentCheckboxes] = useState<ConsentCheckboxes>({
    personalDataCollection: false,
    personalDataThirdParty: false,
    personalDataCompany: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. useEffect 그룹
  useEffect(() => {
    if (isOpen) {
      console.log("LeadFlow render", { isOpen, step, isConsentOpen });
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // 3. useCallback 그룹
  const handleBackClick = useCallback(() => {
    if (isConsentOpen) {
      setIsConsentOpen(false);
    } else if (isTimeSlotOpen) {
      setIsTimeSlotOpen(false);
    } else if (step === 3) {
      setStep(2);
      setErrorMessage("");
    } else if (step === 2) {
      setStep(1);
      setErrorMessage("");
    } else if (step === 1) {
      onClose();
      setStep(1);
      setFormData({ name: "", phone: "", region: "", memo: "", bookingDate: "", bookingTime: "" });
      setConsentCheckboxes({
        personalDataCollection: false,
        personalDataThirdParty: false,
        personalDataCompany: false,
      });
      setErrorMessage("");
      setIsConsentOpen(false);
      setIsTimeSlotOpen(false);
    } else if (step === "done") {
      onClose();
      setStep(1);
      setFormData({ name: "", phone: "", region: "", memo: "", bookingDate: "", bookingTime: "" });
      setConsentCheckboxes({
        personalDataCollection: false,
        personalDataThirdParty: false,
        personalDataCompany: false,
      });
      setErrorMessage("");
      setIsConsentOpen(false);
      setIsTimeSlotOpen(false);
    }
  }, [step, isConsentOpen, isTimeSlotOpen, onClose]);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      // 전화번호 자동 포맷팅
      if (name === "phone") {
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, "");
        
        // 11자리 숫자인 경우 010-xxxx-xxxx 형식으로 변환
        let formatted = numbers;
        if (numbers.length <= 3) {
          formatted = numbers;
        } else if (numbers.length <= 7) {
          formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 11) {
          formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        } else {
          // 11자리 초과 시 잘라내기
          formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
        
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  const isStep1Valid = formData.name.trim() !== "" && formData.phone.trim() !== "";
  const isStep2Valid = formData.bookingDate.trim() !== "" && formData.bookingTime.trim() !== "";
  const isStep3Valid = true; // Step 3는 선택사항

  const handleStep1Next = useCallback(() => {
    if (!isStep1Valid) {
      setErrorMessage("이름과 연락처는 필수 입력입니다.");
      return;
    }
    
    // 전화번호 형식 검증 (010-xxxx-xxxx)
    const phonePattern = /^010-\d{4}-\d{4}$/;
    if (!phonePattern.test(formData.phone)) {
      setErrorMessage("연락처는 010-0000-0000 형식으로 입력해주세요.");
      return;
    }
    
    setStep(2);
    setErrorMessage("");
  }, [isStep1Valid, formData.phone]);

  const handleStep2Next = useCallback(() => {
    if (!isStep2Valid) {
      setErrorMessage("예약 날짜와 시간을 선택해주세요.");
      return;
    }
    setStep(3);
    setErrorMessage("");
  }, [isStep2Valid]);

  const handleDateSelect = useCallback((date: string) => {
    setFormData((prev) => ({ ...prev, bookingDate: date }));
    setIsTimeSlotOpen(true);
  }, []);

  const handleTimeConfirm = useCallback((time: string) => {
    setFormData((prev) => ({ ...prev, bookingTime: time }));
    setIsTimeSlotOpen(false);
  }, []);

  const handleSubmitClick = useCallback(() => {
    // Step 3에서는 선택사항이므로 바로 동의 단계로
    setIsConsentOpen(true);
  }, []);

  const handleConsentCheckboxChange = useCallback(
    (key: keyof ConsentCheckboxes, value: boolean) => {
      setConsentCheckboxes((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleConsentConfirm = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        message: formData.memo ?? "",
      };

      console.log("Submitting form payload:", payload);

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid response format:", text);
        setErrorMessage("❌ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.ok === true) {
        setStep("done");
        setIsConsentOpen(false);
      } else {
        const errorMsg =
          data.message || "요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
        setErrorMessage(`❌ ${errorMsg}`);
      }
    } catch (error) {
      setErrorMessage("❌ 네트워크 오류가 발생했습니다.");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleCompleteConfirm = useCallback(() => {
    console.log("LeadFlow done -> refreshStats");
    refreshStats();
    onClose();
    setStep(1);
    setFormData({ name: "", phone: "", region: "", memo: "", bookingDate: "", bookingTime: "" });
    setConsentCheckboxes({
      personalDataCollection: false,
      personalDataThirdParty: false,
      personalDataCompany: false,
    });
    setErrorMessage("");
    setIsConsentOpen(false);
    setIsTimeSlotOpen(false);
  }, [onClose, refreshStats]);

  // ========================================
  // 규칙 B: 조기 return은 hooks 선언 "아래"에만 위치
  // ========================================
  if (!isOpen) return null;

  // ========================================
  // 조건부 렌더링
  // ========================================

  // 완료 화면
  if (step === "done") {
    return <CompleteScreen onConfirm={handleCompleteConfirm} />;
  }

  const headerStep: 1 | 2 | 3 = step;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="w-full lg:max-w-[1100px] lg:mx-auto lg:px-12">
        <StepHeader currentStep={headerStep} onBack={handleBackClick} />

        {/* 메인 콘텐츠 (상단 padding으로 헤더 아래 배치) */}
        <div className="pt-[112px] pb-[100px] px-4 lg:px-6 lg:pb-10">
          
          {/* Step 1: 기본 정보 입력 */}
          {step === 1 && (
            <div className="max-w-[640px] mx-auto">
              <h1 className="text-[28px] md:text-[26px] font-bold text-gray-900 mb-6 md:mb-5">
                포토부스 렌탈 신청
              </h1>

              {/* 이름 */}
              <div className="mb-5">
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  이름 <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="예: 김철수"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              {/* 연락처 */}
              <div className="mb-5">
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  연락처 <span className="text-[#7c3aed]">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={handleFormChange}
                  maxLength={13}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg text-[13px] text-red-600 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Step 2: 예약 날짜/시간 선택 */}
          {step === 2 && (
            <div className="max-w-[640px] mx-auto">
              <h1 className="text-[28px] md:text-[26px] font-bold text-gray-900 mb-2">
                예약 날짜 선택
              </h1>
              <p className="text-gray-600 mb-6">
                원하시는 날짜를 선택하고 시간을 정해주세요
              </p>

              <BookingCalendar
                onSelectDate={handleDateSelect}
                selectedDate={formData.bookingDate}
              />

              {/* 선택된 예약 정보 */}
              {formData.bookingDate && formData.bookingTime && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-700 mb-1">선택한 예약</div>
                  <div className="text-lg font-bold text-purple-700">
                    {formData.bookingDate} {formData.bookingTime}
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, bookingDate: "", bookingTime: "" }))}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    다시 선택하기
                  </button>
                </div>
              )}

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg text-[13px] text-red-600 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Step 3: 추가 정보 (선택사항) */}
          {step === 3 && (
            <div className="max-w-[640px] mx-auto">
              <h1 className="text-[28px] md:text-[26px] font-bold text-gray-900 mb-2">
                추가 정보
              </h1>
              <p className="text-gray-600 mb-6">
                선택사항입니다. 원하시면 작성해주세요.
              </p>

              {/* 지역 */}
              <div className="mb-5">
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  지역
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleFormChange}
                  placeholder="예: 강남구, 서초구"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors bg-white"
                />
              </div>

              {/* 문의 내용 */}
              <div className="mb-5">
                <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                  문의 내용
                </label>
                <textarea
                  name="memo"
                  placeholder="행사 종류, 요청사항 등을 자유롭게 작성해주세요"
                  rows={5}
                  value={formData.memo}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] resize-none transition-colors"
                />
              </div>

              {/* 예약 정보 확인 */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">신청 정보 확인</div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">이름:</span> <span className="font-medium">{formData.name}</span></div>
                  <div><span className="text-gray-600">연락처:</span> <span className="font-medium">{formData.phone}</span></div>
                  <div><span className="text-gray-600">예약:</span> <span className="font-medium text-purple-600">{formData.bookingDate} {formData.bookingTime}</span></div>
                </div>
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg text-[13px] text-red-600 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 하단 버튼 - 진짜 fixed로 고정 */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/10"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="px-4 py-3">
            <div className="max-w-[640px] mx-auto">
              {step === 1 && (
                <button
                  onClick={handleStep1Next}
                  disabled={!isStep1Valid}
                  className={`w-full h-14 flex items-center justify-center rounded-[12px] font-bold text-base transition-colors ${
                    isStep1Valid
                      ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] active:scale-[0.98] cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  다음
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleStep2Next}
                  disabled={!isStep2Valid}
                  className={`w-full h-14 flex items-center justify-center rounded-[12px] font-bold text-base transition-colors ${
                    isStep2Valid
                      ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] active:scale-[0.98] cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  다음
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handleSubmitClick}
                  className="w-full h-14 flex items-center justify-center rounded-[12px] font-bold text-base bg-[#7c3aed] text-white hover:bg-[#6d28d9] active:scale-[0.98] cursor-pointer transition-colors"
                >
                  신청 완료하기
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 시간 선택 바텀시트 */}
      {isTimeSlotOpen && (
        <TimeSlotSheet
          isOpen={isTimeSlotOpen}
          selectedDate={formData.bookingDate}
          onClose={() => setIsTimeSlotOpen(false)}
          onConfirm={handleTimeConfirm}
        />
      )}

      {/* 약관 동의 바텀시트 */}
      {isConsentOpen && (
        <BottomSheetConsent
          isOpen={isConsentOpen}
          onClose={() => setIsConsentOpen(false)}
          onConfirm={handleConsentConfirm}
          checkboxes={consentCheckboxes}
          onCheckboxChange={handleConsentCheckboxChange}
          isLoading={loading}
        />
      )}
    </div>
  );
}
