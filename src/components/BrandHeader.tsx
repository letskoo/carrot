"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function BrandHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 lg:w-8 lg:h-8 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image
                src="/images/icons/logo.jpg"
                alt="바나타이거 로고"
                fill
                className="object-cover"
              />
            </button>
            <span className="text-[13px] font-medium text-gray-900 lg:text-base">포토그루브</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-hidden cursor-pointer"
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
            <img
              src="/images/icons/logo.jpg"
              alt="포토그루브 로고"
              className="max-w-full max-h-full w-auto h-auto object-contain"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
