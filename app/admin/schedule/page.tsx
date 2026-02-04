"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminSchedulePage() {
  const router = useRouter();
  const { languageContent } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 로컬스토리지에서 토큰 확인
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.ok) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        setPassword("");
      } else {
        setError(data.message || "비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] space-y-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {languageContent?.adminLogin || "관리자 로그인"}
            </h1>
            <p className="text-sm text-gray-600">
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={languageContent?.adminPasswordPlaceholder || "비밀번호를 입력하세요"}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-300 rounded-none text-center placeholder:text-center focus:outline-none focus:border-purple-600 transition-colors"
                disabled={loading}
              />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (languageContent?.adminLoggingInButton || "로그인 중...") : (languageContent?.adminLoginButton || "로그인")}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="block mx-auto text-xs text-gray-400 font-medium hover:text-gray-500 transition-colors cursor-pointer mt-2"
              >
                {languageContent?.adminBackButton || "돌아가기 →"}
              </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[640px] mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{languageContent?.adminDashboard || "관리자 대시보드"}</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {languageContent?.adminLogout || "로그아웃"}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[640px] mx-auto px-6 py-12">
        <div className="flex flex-col gap-12">
          {/* 1. 예약 일정 설정 */}
          <div className="flex flex-col py-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{languageContent?.scheduleSettingsTitle || "예약 일정 설정"}</h2>
              <p className="text-sm text-gray-500">{languageContent?.scheduleSettingsDesc || "대량으로 예약 가능 일정을 생성합니다"}</p>
            </div>
            <button 
              onClick={() => router.push("/admin/schedule/manage")}
              className="mt-4 text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors text-left cursor-pointer"
            >
              {languageContent?.scheduleSettingsButton || "일정 설정하기 →"}
            </button>
          </div>

          {/* 2. 메인 콘텐츠 */}
          <div className="flex flex-col py-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{languageContent?.mainContentTitle || "메인 콘텐츠 수정"}</h2>
              <p className="text-sm text-gray-500">{languageContent?.mainContentDesc || "제목, 소제목, 혜택 항목 등을 수정합니다"}</p>
            </div>
            <button 
              onClick={() => router.push("/admin/content/manage")}
              className="mt-4 text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors text-left cursor-pointer"
            >
              {languageContent?.mainContentButton || "콘텐츠 수정하기 →"}
            </button>
          </div>

          {/* 3. 비밀번호 변경 및 기타 설정 */}
          <div className="flex flex-col py-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{languageContent?.passwordSettingsTitle || "비밀번호 변경 및 기타 설정"}</h2>
              <p className="text-sm text-gray-500">{languageContent?.passwordSettingsDesc || "비밀번호, 다국어, SMS 안내사항을 설정합니다"}</p>
            </div>
            <button 
              onClick={() => router.push("/admin/password/change")}
              className="mt-4 text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors text-left cursor-pointer"
            >
              {languageContent?.passwordSettingsButton || "설정하기 →"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
