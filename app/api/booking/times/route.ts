import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimeSlots } from "../../../../lib/googleSheets";

/**
 * 특정 날짜의 예약 가능한 시간 조회
 * GET /api/booking/times?date=2026-02-15
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          ok: false,
          message: "date 파라미터가 필요합니다. (형식: YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }

    const result = await getAvailableTimeSlots(date);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        slots: result.availableSlots || [],
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          message: result.error || "시간 조회 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[booking/times] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "시간 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
