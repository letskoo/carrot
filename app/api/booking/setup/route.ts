import { NextResponse } from "next/server";
import { setupBookingSheets } from "../../../../lib/googleSheets";

/**
 * 구글 시트 자동 초기화 엔드포인트
 * 브라우저에서 /api/booking/setup 방문하면 자동으로 시트 설정
 */
export async function GET() {
  try {
    console.log("[booking/setup] Starting setup...");
    
    const result = await setupBookingSheets();
    
    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          message: result.error || "설정 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[booking/setup] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "예약 시스템 설정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
