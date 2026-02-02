import { NextRequest, NextResponse } from "next/server";
import { getAvailableDates } from "../../../../lib/googleSheets";

/**
 * 예약 가능한 날짜 목록 조회
 * GET /api/booking/dates?month=2026-02
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        {
          ok: false,
          message: "month 파라미터가 필요합니다. (형식: YYYY-MM)",
        },
        { status: 400 }
      );
    }

    const result = await getAvailableDates(month);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        dates: result.dates || [],
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          message: result.error || "날짜 조회 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[booking/dates] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "날짜 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
