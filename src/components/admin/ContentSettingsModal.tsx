"use client";

import { useState, useEffect } from "react";

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
  benefits: Benefit[];
}

// 프리뷰 컴포넌트
function PreviewSection({ settings }: { settings: ContentSettings }) {
  return (
    <div className="border-l border-gray-200 p-6 space-y-6 bg-gray-50 max-h-[600px] overflow-y-auto">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 mb-2">미리보기</h4>
        <div className="bg-white rounded-lg p-4 space-y-4">
          {/* 메인 타이틀 */}
          <div>
            <h5 className="text-[16px] font-bold text-gray-900">
              {settings.mainTitle}
            </h5>
          </div>

          {/* 서브 타이틀 */}
          <div>
            <p className="text-[13px] text-gray-600">
              {settings.mainSubtitle}
            </p>
          </div>

          {/* 신청 정보 */}
          <div className="bg-purple-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">신청항목</span>
              <span className="font-semibold">{settings.applicationItem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">상호명</span>
              <span className="font-semibold">{settings.companyName}</span>
            </div>
          </div>

          {/* 혜택 항목 미리보기 (처음 2개만) */}
          <div className="space-y-2">
            <h6 className="text-sm font-semibold text-gray-700">혜택 항목</h6>
            {settings.benefits.slice(0, 2).map((benefit) => (
              <div key={benefit.number} className="text-xs">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[10px]">
                    {benefit.number}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{benefit.title}</p>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {settings.benefits.length > 2 && (
              <p className="text-xs text-gray-500 italic">
                +{settings.benefits.length - 2}개 더보기
              </p>
            )}
          </div>

          {/* 버튼 */}
          <div>
            <button className="w-full py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg">
              {settings.ctaButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<ContentSettings>({
    mainTitle: "포토부스 체험단 모집",
    mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
    applicationItem: "포토부스 렌탈",
    companyName: "포토그루브",
    ctaButtonText: "지금 신청하기",
    formTitle: "신청이 완료 되었어요",
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 각 설정을 개별적으로 저장
      const keys = [
        "mainTitle",
        "mainSubtitle",
        "applicationItem",
        "companyName",
        "ctaButtonText",
        "formTitle",
        "benefits",
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
    } catch (err) {
      setError("❌ 저장 중 오류가 발생했습니다");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1200px] max-h-[90vh] overflow-hidden flex">
        {/* 폼 섹션 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">✏️ 메인 콘텐츠 수정</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="닫기"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 폼 콘텐츠 */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* 메인 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">메인 페이지</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                메인 제목
              </label>
              <input
                type="text"
                value={settings.mainTitle}
                onChange={(e) => handleChange("mainTitle", e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                서브 제목
              </label>
              <input
                type="text"
                value={settings.mainSubtitle}
                onChange={(e) =>
                  handleChange("mainSubtitle", e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* 신청 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">신청 정보</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                신청 항목
              </label>
              <input
                type="text"
                value={settings.applicationItem}
                onChange={(e) =>
                  handleChange("applicationItem", e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상호명
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* 버튼 텍스트 섹션 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">버튼 & 문구</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                하단 CTA 버튼
              </label>
              <input
                type="text"
                value={settings.ctaButtonText}
                onChange={(e) =>
                  handleChange("ctaButtonText", e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                완료 페이지 제목
              </label>
              <input
                type="text"
                value={settings.formTitle}
                onChange={(e) => handleChange("formTitle", e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* 혜택 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">혜택 항목</h3>
              <button
                type="button"
                onClick={addBenefit}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
              >
                + 추가
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {settings.benefits.map((benefit, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      항목 {benefit.number}
                    </span>
                    {settings.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={benefit.title}
                      onChange={(e) =>
                        handleBenefitChange(index, "title", e.target.value)
                      }
                      placeholder="제목"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600"
                    />
                    <textarea
                      value={benefit.description}
                      onChange={(e) =>
                        handleBenefitChange(index, "description", e.target.value)
                      }
                      placeholder="설명"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {message}
            </div>
          )}
        </div>

        {/* 버튼 푸터 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
        </form>

        {/* 프리뷰 섹션 */}
        <PreviewSection settings={settings} />
      </div>
    </div>
  );
}
