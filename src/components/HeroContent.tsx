"use client";

import { useEffect, useState } from "react";
import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";

interface AdminSettings {
  mainTitle?: string;
  mainSubtitle?: string;
}

export default function HeroContent() {
  const { statsVersion } = useLeadFlow();
  const [stats, setStats] = useState<{
    totalCount: number;
    last30DaysCount: number;
  } | null>(null);
  const [settings, setSettings] = useState<AdminSettings>({
    mainTitle: "포토부스 체험단 모집",
    mainSubtitle: "뜨거운 반응, 네컷사진 포토부스 실비렌탈",
  });
  const [loading, setLoading] = useState(true);

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

        // 관리자 설정 조회
        const settingsResponse = await fetch("/api/admin/settings");
        const settingsData = await settingsResponse.json();
        
        if (settingsData.ok && settingsData.settings) {
          setSettings((prev) => ({
            ...prev,
            mainTitle: settingsData.settings.mainTitle || prev.mainTitle,
            mainSubtitle: settingsData.settings.mainSubtitle || prev.mainSubtitle,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [statsVersion]);

  const statsText = loading
    ? "신청자 수 불러오는 중…"
    : stats
    ? `최근 한달간 ${stats.last30DaysCount}명 신청 중 ( 누적 ${stats.totalCount}명 )`
    : "전국 가맹점이 신청 중입니다";

  return (
    <div className="pt-2 pb-5">
      <div>
      <h1 className="text-[22px] font-bold text-gray-900 mb-2 leading-snug md:text-2xl md:mb-3">
        {settings.mainTitle}
      </h1>
      <p className="text-[14px] text-gray-600 mb-1 leading-relaxed md:text-base md:mb-1.5">
        {settings.mainSubtitle}
      </p>
      <div className="flex items-center gap-1 text-[#7c3aed] text-[13px] md:text-sm">
        <svg className="w-4 h-4 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span className="font-semibold">{statsText}</span>
      </div>
      </div>
    </div>
  );
}
