"use client";

import HeroSlider from "@/components/HeroSlider";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { currentLanguage, setLanguage, availableLanguages, languageContent, isLoading } = useLanguage();

  // 콘솔 로그 추가 (매 렌더링마다 실행됨)
  console.log("[Page] Rendering with currentLanguage:", currentLanguage);
  console.log("[Page] languageContent:", languageContent);

  const languageNames = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 EN",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
  };

  // 기본값 설정
  const mainTitle = languageContent?.mainTitle || "포토부스 체험단 모집";
  const mainSubtitle = languageContent?.mainSubtitle || "뜨거운 반응, 네컷사진 포토부스 실비렌탈";
  const ctaButtonText = languageContent?.ctaButtonText || "지금 신청하기";

  console.log("[Page] mainTitle:", mainTitle);
  console.log("[Page] Display check - content exists:", !!languageContent);

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더: 언어 선택 드롭다운 */}
      <div className="pt-4 pb-2 px-4 flex justify-end max-w-[640px] mx-auto">
        <select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="text-[12px] font-semibold text-gray-300 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {languageNames[lang]}
            </option>
          ))}
        </select>
      </div>

      <HeroSlider />

      <section className="px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{mainTitle}</h2>
          <p className="text-sm text-gray-600 mb-6">{mainSubtitle}</p>
          
          <ol className="space-y-5">
            <li>
              <p className="font-bold">가맹비 0원! 24시간 운영 무인카페</p>
              <p className="text-sm text-gray-600">
                초기 비용 최소화 · 자판기 렌탈만으로도 창업 가능!
              </p>
            </li>
            <li>
              <p className="font-bold">렌탈/최장 48개월 분납 지원</p>
              <p className="text-sm text-gray-600">
                일시불 · 분납 · 월 렌탈 선택 가능
              </p>
            </li>
            <li>
              <p className="font-bold">정품 캡슐 사용 / 고수익</p>
              <p className="text-sm text-gray-600">
                브랜드 커피를 24시간 제공
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section id="apply" className="px-4 pb-28">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5">
          <button
            disabled={isLoading}
            className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-extrabold text-white disabled:bg-gray-400 hover:bg-orange-600"
          >
            {isLoading ? "로딩 중..." : ctaButtonText}
          </button>
        </div>
      </section>
    </main>
  );
}
