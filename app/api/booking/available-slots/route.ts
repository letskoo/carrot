import { NextResponse } from "next/server";
import { getAllTimeSlots } from "../../../../lib/googleSheets";

/**
 * GET /api/booking/available-slots
 * 관리자용 전체 예약 시간표 조회
 */
export async function GET() {
  try {
    const result = await getAllTimeSlots();

    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: result.error || "시간표 조회 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      slots: result.slots || [],
    });
  } catch (error: any) {
    console.error("[booking/available-slots] Error:", error);
    return NextResponse.json(
      { ok: false, message: "시간표 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
