"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TimeSlot {
  date: string;
  time: string;
  capacity: number;
  bookedCount: number;
}

export default function ScheduleManagePage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  // 대량 생성 폼
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekdayCapacity, setWeekdayCapacity] = useState(3);
  const [weekdayTimes, setWeekdayTimes] = useState("10:00,12:00,14:00,16:00,18:00,20:00");
  const [weekendCapacity, setWeekendCapacity] = useState(2);
  const [weekendTimes, setWeekendTimes] = useState("14:00,16:00,18:00,20:00");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/booking/available-slots");
      const data = await response.json();
      
      if (data.ok && data.slots) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (date: string, time: string) => {
    const key = `${date}_${time}`;
    const newSelected = new Set(selectedSlots);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedSlots(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedSlots.size === 0) return;
    if (!confirm(`선택한 ${selectedSlots.size}개의 일정을 삭제하시겠습니까?`)) return;

    try {
      const slotsToDelete = Array.from(selectedSlots).map((key) => {
        const [date, time] = key.split("_");
        return { date, time };
      });

      const response = await fetch("/api/booking/delete-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsToDelete }),
      });

      if (response.ok) {
        setMessage("✅ 선택한 일정이 삭제되었습니다");
        setSelectedSlots(new Set());
        fetchSlots();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete slots:", error);
      setMessage("❌ 삭제 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!startDate || !endDate) {
      setMessage("❌ 시작일과 종료일을 입력해주세요");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/booking/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          weekday: {
            capacity: weekdayCapacity,
            times: weekdayTimes.split(",").map((t) => t.trim()),
          },
          weekend: {
            capacity: weekendCapacity,
            times: weekendTimes.split(",").map((t) => t.trim()),
          },
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage(`✅ ${data.created}개의 일정이 생성되었습니다`);
        fetchSlots();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.message || "일정 생성에 실패했습니다"}`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to generate schedule:", error);
      setMessage("❌ 일정 생성 중 오류가 발생했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // 달력용 데이터: 날짜별로 예약이 있는지 확인
  const datesWithBookings = Object.keys(groupedSlots).reduce((acc, date) => {
    const hasBookings = groupedSlots[date].some(slot => slot.bookedCount > 0);
    acc[date] = hasBookings;
    return acc;
  }, {} as Record<string, boolean>);

  const handleDateClick = (date: string) => {
    router.push(`/admin/schedule/manage/${date}`);
  };

  // 현재 달력에 표시할 달의 날짜들 생성
  const generateCalendarDays = () => {
    const allDates = Object.keys(groupedSlots).sort();
    if (allDates.length === 0) return [];

    const firstDate = new Date(allDates[0]);
    const lastDate = new Date(allDates[allDates.length - 1]);
    
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 이전 달 빈칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, dayOfMonth: null });
    }
    
    // 이번 달 날짜들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, dayOfMonth: day });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

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
          <h1 className="text-lg font-bold text-gray-900">예약 일정 설정</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-page-content">
        <div className="max-w-[640px] mx-auto">
          
          {/* 대량 생성 섹션 */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-[20px] font-bold text-gray-900 mb-6">대량 일정 생성</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                    시작일 <span className="text-[#7c3aed]">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                    종료일 <span className="text-[#7c3aed]">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              {/* 평일 설정 */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-gray-900">평일 설정</h3>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    최대 예약 수
                  </label>
                  <input
                    type="number"
                    value={weekdayCapacity}
                    onChange={(e) => setWeekdayCapacity(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    예약 가능 시간 (쉼표로 구분)
                  </label>
                  <textarea
                    value={weekdayTimes}
                    onChange={(e) => setWeekdayTimes(e.target.value)}
                    rows={3}
                    placeholder="예: 10:00,12:00,14:00,16:00,18:00,20:00"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              {/* 주말 설정 */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-gray-900">주말 설정</h3>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    최대 예약 수
                  </label>
                  <input
                    type="number"
                    value={weekendCapacity}
                    onChange={(e) => setWeekendCapacity(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    예약 가능 시간 (쉼표로 구분)
                  </label>
                  <textarea
                    value={weekendTimes}
                    onChange={(e) => setWeekendTimes(e.target.value)}
                    rows={3}
                    placeholder="예: 14:00,16:00,18:00,20:00"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 기존 일정 관리 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">
                기존 일정 ({slots.length}개)
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">로딩 중...</div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                생성된 일정이 없습니다
              </div>
            ) : (
              <div>
                {/* 달력 */}
                <div className="mb-6">
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                      <div key={idx} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                      if (!day.date) {
                        return <div key={idx} className="aspect-square" />;
                      }
                      
                      const hasSlots = groupedSlots[day.date];
                      const hasBookings = datesWithBookings[day.date];
                      
                      // 오늘 날짜 체크
                      const today = new Date();
                      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      const isToday = day.date === todayStr;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => hasSlots && handleDateClick(day.date!)}
                          disabled={!hasSlots}
                          className={`aspect-square rounded-lg border-2 transition-all text-sm font-semibold ${
                            hasBookings
                              ? "border-purple-600 bg-purple-600 text-white hover:bg-purple-700"
                              : isToday
                              ? "border-purple-600 bg-white text-purple-700 hover:border-purple-700"
                              : "border-gray-200 text-gray-300 cursor-default"
                          }`}
                        >
                          {day.dayOfMonth}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 메시지 */}
          {message && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg text-center text-sm">
              {message}
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10">
        <div className="px-4 py-3">
          <div className="max-w-[640px] mx-auto">
            {selectedSlots.size > 0 ? (
              <button
                onClick={handleDeleteSelected}
                className="w-full h-14 rounded-[12px] bg-red-600 text-base font-bold text-white hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                선택 삭제 ({selectedSlots.size}개)
              </button>
            ) : (
              <button
                onClick={handleGenerateSchedule}
                disabled={generating}
                className="w-full h-14 rounded-[12px] bg-[#7c3aed] text-base font-bold text-white hover:bg-[#6d28d9] transition-colors active:scale-[0.98] disabled:bg-gray-300"
              >
                {generating ? "생성 중..." : "일정 생성"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

