"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordChangePage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("❌ 모든 필드를 입력해주세요");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ 비밀번호가 일치하지 않습니다");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (newPassword.length < 4) {
      setMessage("❌ 비밀번호는 최소 4자 이상이어야 합니다");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "password",
          value: newPassword,
        }),
      });

      if (response.ok) {
        setMessage("✅ 비밀번호가 변경되었습니다");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setMessage("");
          router.back();
        }, 2000);
      } else {
        setMessage("❌ 비밀번호 변경에 실패했습니다");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage("❌ 비밀번호 변경 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 text-gray-900 hover:text-gray-600"
            aria-label="뒤로가기"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">비밀번호 변경</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content">
        <div className="max-w-[640px] mx-auto">
          <div className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                새 비밀번호 <span className="text-[#7c3aed]">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                비밀번호 확인 <span className="text-[#7c3aed]">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              ℹ️ 비밀번호는 최소 4자 이상이어야 합니다
            </div>

            {/* 메시지 */}
            {message && (
              <div className="p-4 bg-purple-50 rounded-lg text-center text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10">
        <div className="px-4 py-3">
          <div className="max-w-[640px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 rounded-[12px] bg-[#7c3aed] text-base font-bold text-white hover:bg-[#6d28d9] transition-colors active:scale-[0.98] disabled:bg-gray-300"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
