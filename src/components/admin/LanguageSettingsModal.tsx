"use client";

import { useState, useEffect } from "react";

interface LanguageContent {
  [key: string]: string;
}

export default function LanguageSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [languages, setLanguages] = useState<{
    [key: string]: LanguageContent;
  }>({
    ko: {
      mainTitle: "포토부스 체험단 모집",
      mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
    },
    en: {
      mainTitle: "Photobooth Experience Program",
      mainSubtitle: "Hot response, 4-cut photo booth rental at actual cost",
    },
    ja: {
      mainTitle: "フォトブース体験プログラム募集",
      mainSubtitle: "好評のため、4コマ写真フォトブースを実費レンタル",
    },
  });

  const [activeLanguage, setActiveLanguage] = useState("ko");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const languageNames: { [key: string]: string } = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 English",
    ja: "🇯🇵 日本語",
  };

  const handleChange = (key: string, value: string) => {
    setLanguages((prev) => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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

      const data = await response.json();

      if (data.ok) {
        setMessage("✅ 다국어 설정이 저장되었습니다");
      } else {
        setError(data.message || "저장 실패");
      }
    } catch (error) {
      setError("오류가 발생했습니다");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentLanguage = languages[activeLanguage] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto my-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">🌍 다국어 설정</h2>
          <button
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 언어 탭 */}
          <div className="flex gap-2 border-b border-gray-200">
            {Object.entries(languageNames).map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => setActiveLanguage(code)}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                  activeLanguage === code
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* 언어별 콘텐츠 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                메인 제목
              </label>
              <input
                type="text"
                value={currentLanguage.mainTitle || ""}
                onChange={(e) => handleChange("mainTitle", e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                서브 제목
              </label>
              <textarea
                value={currentLanguage.mainSubtitle || ""}
                onChange={(e) =>
                  handleChange("mainSubtitle", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* 다른 필드들도 추가 가능 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                신청 항목
              </label>
              <input
                type="text"
                value={currentLanguage.applicationItem || ""}
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
                value={currentLanguage.companyName || ""}
                onChange={(e) =>
                  handleChange("companyName", e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                하단 버튼
              </label>
              <input
                type="text"
                value={currentLanguage.ctaButtonText || ""}
                onChange={(e) =>
                  handleChange("ctaButtonText", e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
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

          <div className="flex gap-3 pt-4">
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
      </div>
    </div>
  );
}
