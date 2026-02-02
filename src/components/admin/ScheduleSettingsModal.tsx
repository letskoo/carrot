"use client";

import { useState } from "react";

interface ScheduleFormData {
  startDate: string;
  endDate: string;
  weekdayCapacity: number;
  weekdayTimes: string;
  weekendCapacity: number;
  weekendTimes: string;
}

export default function ScheduleSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    startDate: "",
    endDate: "",
    weekdayCapacity: 3,
    weekdayTimes: "10:00,12:00,14:00,16:00,18:00,20:00",
    weekendCapacity: 2,
    weekendTimes: "14:00,16:00,18:00,20:00",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Capacity") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!formData.startDate || !formData.endDate) {
        setError("시작 날짜와 종료 날짜를 입력해주세요");
        return;
      }

      const response = await fetch("/api/booking/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage(`✅ ${data.message}`);
        setFormData({
          startDate: "",
          endDate: "",
          weekdayCapacity: 3,
          weekdayTimes: "10:00,12:00,14:00,16:00,18:00,20:00",
          weekendCapacity: 2,
          weekendTimes: "14:00,16:00,18:00,20:00",
        });
      } else {
        setError(data.message || "일정 생성 실패");
      }
    } catch (error) {
      setError("오류가 발생했습니다");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">📅 예약 일정 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              시작 날짜 *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              종료 날짜 *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">평일 설정</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 예약 수
                </label>
                <input
                  type="number"
                  name="weekdayCapacity"
                  value={formData.weekdayCapacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 가능 시간 (쉼표로 구분)
                </label>
                <textarea
                  name="weekdayTimes"
                  value={formData.weekdayTimes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  예: 10:00,12:00,14:00,16:00,18:00,20:00
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">주말 설정</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 예약 수
                </label>
                <input
                  type="number"
                  name="weekendCapacity"
                  value={formData.weekendCapacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 가능 시간 (쉼표로 구분)
                </label>
                <textarea
                  name="weekendTimes"
                  value={formData.weekendTimes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  예: 14:00,16:00,18:00,20:00
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300"
            >
              {loading ? "생성 중..." : "일정 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
