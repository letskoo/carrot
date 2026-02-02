"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface TimeSlot {
  date: string;
  time: string;
  capacity: number;
  bookedCount: number;
}

interface Booking {
  rowIndex: number;
  createdAt: string;
  name: string;
  phone: string;
  region?: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  memo?: string;
}

export default function DateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/booking/available-slots");
      const data = await response.json();
      
      if (data.ok && data.slots) {
        const dateSlots = data.slots
          .filter((slot: TimeSlot) => slot.date === date)
          .sort((a: TimeSlot, b: TimeSlot) => a.time.localeCompare(b.time));
        setSlots(dateSlots);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (time: string) => {
    setBookingsLoading(true);
    try {
      const response = await fetch(`/api/admin/records?date=${date}&time=${time}`);
      const data = await response.json();
      
      if (data.ok && data.records) {
        setBookings(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleTimeClick = (time: string, bookedCount: number) => {
    if (bookedCount === 0) return;
    
    if (selectedTime === time) {
      setSelectedTime(null);
      setBookings([]);
    } else {
      setSelectedTime(time);
      fetchBookings(time);
    }
  };

  const handleStatusChange = async (rowIndex: number, newStatus: string) => {
    // 낙관적 업데이트: 즉시 로컬 상태 변경
    const updatedBookings = bookings.map((b) =>
      b.rowIndex === rowIndex ? { ...b, status: newStatus } : b
    );
    setBookings(updatedBookings);

    try {
      const response = await fetch("/api/admin/records", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex, status: newStatus }),
      });

      if (response.ok) {
        // 백그라운드에서 조용히 새로고침
        fetchSlots();
      } else {
        // 실패 시 원래 상태로 복구
        setBookings(bookings);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // 에러 시 원래 상태로 복구
      setBookings(bookings);
    }
  };

  const handleDeleteBooking = async (rowIndex: number) => {
    if (!confirm("이 예약을 삭제하시겠습니까?")) return;

    // 낙관적 업데이트: 즉시 리스트에서 제거
    const originalBookings = bookings;
    const updatedBookings = bookings.filter((b) => b.rowIndex !== rowIndex);
    setBookings(updatedBookings);

    try {
      const response = await fetch("/api/admin/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex }),
      });

      if (response.ok) {
        // 백그라운드에서 조용히 새로고침
        fetchSlots();
      } else {
        // 실패 시 원래 상태로 복구
        setBookings(originalBookings);
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
      // 에러 시 원래 상태로 복구
      setBookings(originalBookings);
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">{date}</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pt-24 pb-6 px-4">
        <div className="max-w-[640px] mx-auto">
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">로딩 중...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              이 날짜에 예약 가능한 시간이 없습니다
            </div>
          ) : (
            <>
              {/* 시간 슬롯 그리드 */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    const isBooked = slot.bookedCount > 0;

                    return (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeClick(slot.time, slot.bookedCount)}
                        className={`px-4 py-4 text-sm rounded-lg border-2 transition-colors ${
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white font-semibold"
                            : isBooked
                            ? "bg-white border-purple-600 text-purple-700 hover:bg-purple-50"
                            : "border-gray-300 text-gray-400 cursor-default"
                        }`}
                      >
                        <div className="font-semibold text-base">{slot.time}</div>
                        <div className="text-xs mt-1">
                          {slot.bookedCount}/{slot.capacity}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 예약자 현황 */}
              {selectedTime && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {selectedTime} 예약 현황
                  </h2>

                  {bookingsLoading ? (
                    <div className="text-center py-8 text-gray-500">로딩 중...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      예약이 없습니다
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => {
                        const isConfirmed = booking.status === "확정";
                        const statusLabel = isConfirmed ? "확정" : "대기";
                        return (
                        <div
                          key={booking.rowIndex}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {booking.name}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    isConfirmed
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <a
                                  href={`sms:${booking.phone}`}
                                  className="hover:underline"
                                >
                                  {booking.phone}
                                </a>
                              </div>
                              {booking.region && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {booking.region}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-1 mb-2">
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  booking.rowIndex,
                                  isConfirmed ? "대기" : "확정"
                                )
                              }
                              className={`px-2 py-1.5 text-xs font-semibold rounded-md border-2 transition-colors ${
                                isConfirmed
                                  ? "text-gray-700 border-gray-300 hover:bg-gray-50"
                                  : "text-green-700 border-green-600 hover:bg-green-50"
                              }`}
                            >
                              {isConfirmed ? "취소" : "확정"}
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.rowIndex)}
                              className="px-2 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              삭제
                            </button>
                          </div>

                          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded min-h-[56px] whitespace-pre-wrap">
                            {booking.memo || ""}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
