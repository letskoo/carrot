"use client";

import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AdminSettings {
  ctaButtonText?: string;
}

export default function FixedCtaButton() {
  const { openLeadFlow } = useLeadFlow();
  const [buttonText, setButtonText] = useState("지금 신청하기");
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        
        if (data.ok && data.settings?.ctaButtonText) {
          setButtonText(data.settings.ctaButtonText);
        }
      } catch (error) {
        console.error("Failed to fetch button text:", error);
      }
    }

    fetchSettings();
  }, []);

  const handleClick = () => {
    console.log("CTA click - opening lead flow");
    openLeadFlow();
  };

  // 관리자 페이지에서는 버튼 숨김
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-4 py-3">
        <div className="max-w-[640px] mx-auto">
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-14 flex items-center justify-center rounded-[12px] bg-[#7c3aed] text-base font-bold text-white hover:bg-[#6d28d9] transition-colors active:scale-[0.98] cursor-pointer"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
