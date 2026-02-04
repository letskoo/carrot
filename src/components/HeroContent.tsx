"use client";

import { useEffect, useState } from "react";
import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroContent() {
  const { statsVersion } = useLeadFlow();
  const { languageContent } = useLanguage();
  const [stats, setStats] = useState<{
    totalCount: number;
    last30DaysCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // languageContent에서 값 추출 (기본값 설정)
  const mainTitle = languageContent?.mainTitle || "포토부스 체험단 모집";
  const mainSubtitle = languageContent?.mainSubtitle || "뜨거운 반응, 네컷사진 포토부스 실비렌탈";

  useEffect(() => {
    async function fetchData() {
      try {
        // 통계 데이터 조회
        const statsResponse = await fetch("/api/stats");
        const statsData = await statsResponse.json();
        
        if (statsData.ok) {
          setStats({
            totalCount: statsData.totalCount || 0,
            last30DaysCount: statsData.last30DaysCount || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [statsVersion]);

  // 통계 텍스트 템플릿 처리
  const statsLoadingText = languageContent?.statsLoadingText || "신청자 수 불러오는 중... (동시접속자 많을땐 좀 걸립니다)";
  const statsTemplate = languageContent?.statsTemplate || "최근 한달간 {count1}명 신청 중 ( 누적 {count2}명 )";
  
  const statsText = loading
    ? statsLoadingText
    : stats
    ? statsTemplate.replace("{count1}", stats.last30DaysCount.toString()).replace("{count2}", stats.totalCount.toString())
    : "전국 가맹점이 신청 중입니다";

  const statsClassName = loading ? "blink-animation" : "";

  return (
    <div className="py-6 space-y-4">
      {/* 메인 타이틀 */}
      <div className="space-y-2">
        <h1 className="text-[24px] font-extrabold text-gray-900 leading-tight">
          {mainTitle}
        </h1>
        <p className="text-[14px] text-gray-600 font-medium">
          {mainSubtitle}
        </p>
      </div>

      {/* 통계 */}
      <div className="flex items-center gap-2 text-purple-600">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span className={`text-[14px] font-semibold ${statsClassName}`}>
          {statsText}
        </span>
      </div>
    </div>
  );
}
