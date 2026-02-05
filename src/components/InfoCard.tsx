"use client";


import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";


export default function InfoCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessRegistrationImageUrl, setBusinessRegistrationImageUrl] = useState<string>("");
  const { languageContent } = useLanguage();

  useEffect(() => {
    async function loadBusinessRegistrationImage() {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.ok && data.settings?.businessRegistrationImageUrl) {
          setBusinessRegistrationImageUrl(data.settings.businessRegistrationImageUrl);
        } else {
          setBusinessRegistrationImageUrl("");
        }
      } catch (error) {
        setBusinessRegistrationImageUrl("");
        console.error("Failed to load business registration image:", error);
      }
    }
    loadBusinessRegistrationImage();

    // BroadcastChannel로 다른 탭에서 변경사항 감지
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("language-settings-channel");
      const handleBroadcast = (event: MessageEvent) => {
        if (event.data.type === "language-updated") {
          loadBusinessRegistrationImage();
        }
      };
      channel.onmessage = handleBroadcast;
    } catch (error) {
      // 폴백: localStorage 이벤트
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "admin-settings-updated") {
          loadBusinessRegistrationImage();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
    return () => {
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="mb-0.5">
        <div className="p-4 bg-purple-50 rounded-xl">
        <div className="grid gap-y-2.5 gap-x-3" style={{ gridTemplateColumns: '70px 1fr' }}>
          {/* Row 1: 신청항목 */}
           <span className="text-[12px] text-gray-500 lg:text-sm">{languageContent?.applicationItemLabel || "신청항목"}</span>
          <span className="text-[13px] font-semibold text-gray-900 lg:text-base">{languageContent?.applicationItem || "포토부스 렌탈"}</span>

          {/* Row 2: 상호명 */}
           <span className="text-[12px] text-gray-500 lg:text-sm">{languageContent?.companyNameLabel || "상호명"}</span>
          <span className="text-[13px] font-semibold text-gray-900 lg:text-base">{languageContent?.companyName || "포토그루브"}</span>

          {/* Row 3: 사업자등록증 보기 (라벨 컬럼 비움, 간격 50% 축소) */}
          <span className="-mt-1.5"></span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] text-gray-500 underline text-left -mt-1.5 lg:text-base cursor-pointer"
          >
            {languageContent?.businessRegistrationText || "사업자등록증 보기"}
          </button>
        </div>        </div>      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            className="absolute top-4 right-4 z-[10000] flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="w-full h-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {businessRegistrationImageUrl ? (
              <img
                src={businessRegistrationImageUrl}
                alt="사업자등록증"
                className="max-w-full max-h-full w-auto h-auto object-contain"
                style={{ maxWidth: '100vw', maxHeight: '100vh' }}
              />
            ) : (
              <span className="text-white bg-gray-700 px-4 py-2 rounded">사업자등록증 이미지가 없습니다</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
