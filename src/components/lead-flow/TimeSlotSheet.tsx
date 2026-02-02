"use client";

import React, { useState, useEffect } from "react";
import styles from "./ConsentSheet.module.css";

interface TimeSlot {
  time: string;
  booked: number;
  capacity: number;
  available: boolean;
}

interface TimeSlotSheetProps {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export default function TimeSlotSheet({
  isOpen,
  selectedDate,
  onClose,
  onConfirm,
}: TimeSlotSheetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const transitionDuration = 300;

  useEffect(() => {
    let rafId1: number | null = null;
    let rafId2: number | null = null;

    if (isOpen) {
      setIsMounted(true);
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => setIsVisible(true));
      });
      loadAvailableSlots();
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setIsMounted(false), transitionDuration);
      return () => {
        clearTimeout(timeout);
        if (rafId1 !== null) cancelAnimationFrame(rafId1);
        if (rafId2 !== null) cancelAnimationFrame(rafId2);
      };
    }

    return () => {
      if (rafId1 !== null) cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
    };
  }, [isOpen, transitionDuration]);

  async function loadAvailableSlots() {
    setLoading(true);
    setSelectedTime(null);
    try {
      const response = await fetch(
        `/api/booking/times?date=${selectedDate}`
      );
      const data = await response.json();

      if (data.ok) {
        setAvailableSlots(data.slots || []);
      } else {
        console.error("Failed to load time slots:", data.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error loading time slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!selectedTime) return;

    // 선택한 시간의 용량 다시 확인
    const selectedSlot = availableSlots.find((s) => s.time === selectedTime);
    if (selectedSlot && !selectedSlot.available) {
      alert("죄송합니다. 해당 시간이 방금 마감되었습니다.");
      return;
    }

    onConfirm(selectedTime);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${month}월 ${day}일 (${weekday})`;
  }

  if (!isMounted) return null;

  return (
    <>
      {/* 반투명 배경 */}
      <div
        className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />

      {/* 바텀시트 (모바일) / 모달 (데스크톱) - ConsentSheet와 동일한 애니메이션 */}
      <div
        className={`${styles.sheet} ${isVisible ? styles.sheetVisible : ""}`}
      >
        <div className="bg-white rounded-t-2xl shadow-lg max-h-[80vh] overflow-y-auto max-w-[640px] mx-auto md:rounded-t-[24px]">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 rounded-t-2xl md:rounded-t-[24px]">
            <div className="max-w-[640px] mx-auto">
              <h3 className="text-[18px] font-bold text-gray-900 text-center">
                {formatDate(selectedDate)}
              </h3>
              <p className="text-[14px] text-gray-600 mt-2 text-center">
                예약 가능한 시간을 선택해주세요
              </p>
            </div>
          </div>

          {/* 시간 슬롯 목록 (스크롤 가능) */}
          <div className="py-4 space-y-3">
            <div className="max-w-[640px] mx-auto px-4">
              {loading && (
                <div className="text-center py-8 text-gray-500">
                  로딩 중...
                </div>
              )}

              {!loading && availableSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  예약 가능한 시간이 없습니다.
                </div>
              )}

              {!loading && availableSlots.length > 0 && (
                <div className="space-y-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    const isFull = !slot.available;
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => !isFull && setSelectedTime(slot.time)}
                        disabled={isFull}
                        className={`
                          w-full p-4 rounded-lg border-2 text-center font-medium transition-all
                          ${
                            isFull
                              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "border-purple-600 bg-purple-50 text-purple-700 cursor-pointer"
                              : "border-gray-200 bg-white text-gray-900 hover:border-purple-300 cursor-pointer"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{slot.time}</span>
                          <span className="text-sm text-gray-600">
                            {isFull ? "마감" : `${slot.capacity - slot.booked}/${slot.capacity}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="sticky bottom-0 bg-white border-t border-black/10" 
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="px-4 py-3">
              <div className="max-w-[640px] mx-auto">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 h-12 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedTime}
                    className={`
                      flex-1 h-12 rounded-lg font-semibold transition-colors
                      ${
                        selectedTime
                          ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
