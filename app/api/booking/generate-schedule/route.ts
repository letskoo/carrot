import { NextResponse } from "next/server";
import { generateBookingTimesFromSettings } from "../../../../lib/googleSheets";

/**
 * POST /api/booking/generate-schedule
 * Google Form 응답을 받아서 예약 가능 시간 자동 생성
 * 
 * Body:
 * {
 *   startDate: "2026-02-10",
 *   endDate: "2027-02-10",
 *   weekdayCapacity: 3,
 *   weekdayTimes: "10:00,12:00,14:00,16:00,18:00,20:00",
 *   weekendCapacity: 2,
 *   weekendTimes: "14:00,16:00,18:00,20:00"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      startDate,
      endDate,
      weekdayCapacity,
      weekdayTimes,
      weekendCapacity,
      weekendTimes,
    } = body;

    // 유효성 검사
    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, message: "startDate와 endDate는 필수입니다" },
        { status: 400 }
      );
    }

    if (
      weekdayCapacity === undefined ||
      weekendCapacity === undefined ||
      !weekdayTimes ||
      !weekendTimes
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "weekdayCapacity, weekendCapacity, weekdayTimes, weekendTimes는 필수입니다",
        },
        { status: 400 }
      );
    }

    console.log("[booking/generate-schedule] Request received:", {
      startDate,
      endDate,
      weekdayCapacity,
      weekendCapacity,
    });

    // 예약 시간대 생성
    const result = await generateBookingTimesFromSettings({
      startDate,
      endDate,
      weekdayCapacity: Number(weekdayCapacity),
      weekdayTimes: String(weekdayTimes),
      weekendCapacity: Number(weekendCapacity),
      weekendTimes: String(weekendTimes),
    });

    if (result.success) {
      console.log(
        "[booking/generate-schedule] Successfully generated schedule"
      );
      return NextResponse.json({ ok: true, message: result.message });
    } else {
      console.error(
        "[booking/generate-schedule] Generation failed:",
        result.error
      );
      return NextResponse.json(
        { ok: false, message: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[booking/generate-schedule] Exception:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "예약 시간대 생성 중 오류가 발생했습니다",
        detail: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/booking/generate-schedule (테스트용)
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "POST 요청으로 예약 시간대를 생성하세요",
    example: {
      method: "POST",
      url: "/api/booking/generate-schedule",
      body: {
        startDate: "2026-02-10",
        endDate: "2027-02-10",
        weekdayCapacity: 3,
        weekdayTimes: "10:00,12:00,14:00,16:00,18:00,20:00",
        weekendCapacity: 2,
        weekendTimes: "14:00,16:00,18:00,20:00",
      },
    },
  });
}
