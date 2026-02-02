"use client";

import React, { useState, useEffect } from "react";

interface CalendarDay {
  date: string; // YYYY-MM-DD
  status: "available" | "partial" | "full" | "disabled";
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

interface BookingCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

// 로컬 타임존 기준으로 YYYY-MM-DD 문자열 생성
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingCalendar({
  onSelectDate,
  selectedDate,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  // 달력 데이터 가져오기
  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
      const yearMonth = `${year}-${month}`;

      // API 호출
      const response = await fetch(`/api/booking/dates?month=${yearMonth}`);
      const data = await response.json();

      if (!data.ok) {
        console.error("Failed to load booking dates:", data.message);
        return;
      }

      // 달력 그리드 생성
      const days = generateCalendarGrid(
        currentMonth,
        data.dates || []
      );
      setCalendarDays(days);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  }

  function generateCalendarGrid(
    month: Date,
    availableDates: Array<{ date: string; status: string }>
  ): CalendarDay[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // 이번 달 1일
    const firstDay = new Date(year, monthIndex, 1);
    // 이번 달 마지막 날
    const lastDay = new Date(year, monthIndex + 1, 0);

    // 달력 시작 요일 (일요일 = 0)
    const startDayOfWeek = firstDay.getDay();

    // 오늘 날짜 (로컬 타임존 기준)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // 이전 달 빈칸 채우기
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, monthIndex - 1, day);
      days.push({
        date: formatDateToString(date),
        status: "disabled",
        dayOfMonth: day,
        isCurrentMonth: false,
      });
    }

    // 이번 달 날짜 채우기
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, monthIndex, day);
      const dateStr = formatDateToString(date);

      // 과거 날짜는 비활성화
      let status: CalendarDay["status"] = "disabled";
      if (date >= today) {
        const availableDate = availableDates.find((d) => d.date === dateStr);
        if (availableDate) {
          status = availableDate.status as CalendarDay["status"];
        }
      }

      days.push({
        date: dateStr,
        status,
        dayOfMonth: day,
        isCurrentMonth: true,
      });
    }

    // 다음 달 빈칸 채우기 (6주 고정)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, monthIndex + 1, day);
      days.push({
        date: formatDateToString(date),
        status: "disabled",
        dayOfMonth: day,
        isCurrentMonth: false,
      });
    }

    return days;
  }

  function handlePrevMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function handleNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function handleDateClick(day: CalendarDay) {
    if (day.status === "disabled" || day.status === "full") return;
    onSelectDate(day.date);
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 월 선택 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="이전 달"
        >
          <svg
            className="w-6 h-6 text-gray-700"
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

        <h3 className="text-lg font-bold text-gray-900">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          aria-label="다음 달"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-semibold py-2 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          로딩 중...
        </div>
      )}

      {/* 날짜 그리드 */}
      {!loading && (
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isSelected = selectedDate === day.date;
            const isDisabled = day.status === "disabled";
            const isFull = day.status === "full";
            const isAvailable = day.status === "available" || day.status === "partial";

            return (
              <button
                key={`${day.date}-${index}`}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled || isFull}
                className={`
                  aspect-square p-2 rounded-lg text-sm font-medium transition-all
                  ${!day.isCurrentMonth ? "text-gray-300" : ""}
                  ${isDisabled ? "text-gray-300 cursor-not-allowed" : ""}
                  ${isFull ? "bg-purple-600 text-white cursor-not-allowed" : ""}
                  ${isAvailable && !isSelected ? "bg-white border-2 border-gray-200 text-gray-900 hover:border-purple-400 cursor-pointer" : ""}
                  ${isSelected ? "bg-purple-600 text-white border-2 border-purple-600 cursor-pointer" : ""}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{day.dayOfMonth}</span>
                  {isFull && (
                    <span className="text-[10px] mt-0.5">마감</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 범례 */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-white border-2 border-gray-200"></div>
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-purple-600"></div>
          <span>마감</span>
        </div>
      </div>
    </div>
  );
}
