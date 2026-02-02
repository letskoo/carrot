"use client";

import React from "react";

interface CompleteScreenProps {
  onConfirm: () => void;
}

export default function CompleteScreen({ onConfirm }: CompleteScreenProps) {
  return (
    <div className="complete-screen fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[640px] flex flex-col items-center">
        {/* 성공 아이콘 */}
        <div className="mb-5 relative">
          <div className="complete-icon w-16 h-16 rounded-full bg-[#7c3aed] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* 텍스트 */}
        <h1 className="text-[20px] font-bold text-gray-900 text-center mb-1">
          신청이 완료 되었어요
        </h1>
        <p className="text-[15px] text-gray-500 text-center mb-12">
          빠른 시간 내에 연락을 드리겠습니다
        </p>

        {/* 확인 버튼 - 50% 너비 */}
        <div className="w-full max-w-[320px]">
          <button
            onClick={onConfirm}
            className="w-full h-12 rounded-xl bg-[#7c3aed] text-white font-bold text-[15px] hover:bg-[#6d28d9] transition-colors active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      </div>

      <style jsx>{`
        .complete-screen {
          animation: fadeIn 0.3s ease-out;
        }
        .complete-icon {
          animation: scaleIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
