"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

interface Benefit {
  number: number;
  title: string;
  description: string;
}

interface ContentSettings {
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formTitle: string;
  heroImageUrls: string[];
  profileImageUrl: string;
  benefits: Benefit[];
  smsCustomMessage: string;
}

export default function ContentManagePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ContentSettings>({
    mainTitle: "포토부스 체험단 모집",
    mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
    applicationItem: "포토부스 렌탈",
    companyName: "포토그루브",
    ctaButtonText: "지금 신청하기",
    formTitle: "신청이 완료 되었어요",
    heroImageUrls: [],
    profileImageUrl: "",
    smsCustomMessage: "예약일에 만나요! :)",
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
        const newSettings: ContentSettings = {
          mainTitle: data.settings.mainTitle || settings.mainTitle,
          mainSubtitle: data.settings.mainSubtitle || settings.mainSubtitle,
          applicationItem: data.settings.applicationItem || settings.applicationItem,
          companyName: data.settings.companyName || settings.companyName,
          ctaButtonText: data.settings.ctaButtonText || settings.ctaButtonText,
          formTitle: data.settings.formTitle || settings.formTitle,
          heroImageUrls: Array.isArray(data.settings.heroImageUrls)
            ? data.settings.heroImageUrls
            : [],
          profileImageUrl: data.settings.profileImageUrl || "",
          benefits: Array.isArray(data.settings.benefits)
            ? data.settings.benefits
            : settings.benefits,
        };
        setSettings(newSettings);
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
    setMessage("");

    try {
      const keys = [
        "mainTitle",
        "mainSubtitle",
        "applicationItem",
        "companyName",
        "ctaButtonText",
        "formTitle",
        "heroImageUrls",
        "profileImageUrl",
        "benefits",
        "smsCustomMessage",
      ];

      for (const key of keys) {
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            value: settings[key as keyof ContentSettings],
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${key}`);
        }
      }

      setMessage("✅ 설정이 저장되었습니다");
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
          <h1 className="text-lg font-bold text-gray-900">메인 콘텐츠 수정</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content">
        <div className="max-w-[640px] mx-auto space-y-6">
          {/* 메인 섹션 */}
          <div className="space-y-5">
            <h3 className="text-[18px] font-semibold text-gray-900">메인 페이지</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                메인 제목 <span className="text-[#7c3aed]">*</span>
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
                서브 제목
              </label>
              <input
                type="text"
                value={settings.mainSubtitle}
                onChange={(e) => handleChange("mainSubtitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          {/* 이미지 관리 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">이미지 관리</h3>

            <ImageUploader
              title="히어로 슬라이더 이미지 (최대 20개)"
              maxFiles={20}
              maxSizePerFile={5}
              onUpload={async (urls) => {
                setSettings((prev) => ({
                  ...prev,
                  heroImageUrls: urls,
                }));
              }}
            />

            <ImageUploader
              title="프로필 이미지 (1개)"
              maxFiles={1}
              maxSizePerFile={5}
              onUpload={async (urls) => {
                setSettings((prev) => ({
                  ...prev,
                  profileImageUrl: urls[0] || "",
                }));
              }}
            />
          </div>

          {/* 신청 정보 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold text-gray-900">신청 정보</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                신청 항목
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
                상호명
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
            <h3 className="text-[18px] font-semibold text-gray-900">버튼 & 문구</h3>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                하단 CTA 버튼
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
                완료 페이지 제목
              </label>
              <input
                type="text"
                value={settings.formTitle}
                onChange={(e) => handleChange("formTitle", e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                SMS 추가 메시지
              </label>
              <textarea
                value={settings.smsCustomMessage}
                onChange={(e) => handleChange("smsCustomMessage", e.target.value)}
                placeholder="예약 확정 문자에 포함될 추가 메시지를 입력하세요\n예) 당일 연락주세요: 010-1234-5678"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                예약자, 날짜, 시간 정보 아래에 표시됩니다. 연락처, 주소 등 추가 정보를 입력하세요.
              </p>
            </div>
          </div>

          {/* 혜택 섹션 */}
          <div className="space-y-5 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-gray-900">혜택 항목</h3>
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 cursor-pointer"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-4">
              {settings.benefits.map((benefit, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-semibold text-gray-900">
                      항목 {benefit.number}
                    </span>
                    {settings.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold cursor-pointer"
                      >
                        삭제
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
                      placeholder="제목"
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                    />
                    <textarea
                      value={benefit.description}
                      onChange={(e) =>
                        handleBenefitChange(index, "description", e.target.value)
                      }
                      placeholder="설명"
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
