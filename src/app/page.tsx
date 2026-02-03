"use client";

import HeroSlider from "@/components/HeroSlider";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  console.log("[Home Page] availableLanguages:", availableLanguages);
  console.log("[Home Page] availableLanguages.length:", availableLanguages.length);
  console.log("[Home Page] Show dropdown?:", availableLanguages.length > 1);

  const languageNames = {
    ko: "🇰🇷 한국어",
    en: "🇬🇧 EN",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더: 언어 선택 드롭다운 */}
      <div className="pt-4 pb-2 px-4 flex justify-end max-w-[640px] mx-auto">
        {availableLanguages.length > 1 && (
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
        )}
      </div>

      <HeroSlider />

      <section className="px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5">
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
          <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-extrabold text-white">
            신청하기
          </button>
        </div>
      </section>

    </main>
  );
}
