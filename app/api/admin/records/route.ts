import { NextRequest, NextResponse } from "next/server";
import { getLeadsByDateTime, updateLeadStatus, deleteLead } from "../../../../lib/googleSheets";

/**
 * GET /api/admin/records?date=YYYY-MM-DD&time=HH:MM
 * 특정 날짜/시간의 예약 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    if (!date || !time) {
      return NextResponse.json(
        { ok: false, message: "date와 time 파라미터가 필요합니다" },
        { status: 400 }
      );
    }

    const result = await getLeadsByDateTime(date, time);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        records: result.records || [],
      });
    } else {
      return NextResponse.json(
        { ok: false, message: result.error || "조회 실패" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[admin/records GET] Error:", error);
    return NextResponse.json(
      { ok: false, message: "조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/records
 * 예약 상태 변경
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, status } = body;

    if (!rowIndex || !status) {
      return NextResponse.json(
        { ok: false, message: "rowIndex와 status가 필요합니다" },
        { status: 400 }
      );
    }

    const result = await updateLeadStatus(rowIndex, status);

    if (result.success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { ok: false, message: result.error || "상태 변경 실패" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[admin/records PUT] Error:", error);
    return NextResponse.json(
      { ok: false, message: "상태 변경 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/records
 * 예약 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex } = body;

    if (!rowIndex) {
      return NextResponse.json(
        { ok: false, message: "rowIndex가 필요합니다" },
        { status: 400 }
      );
    }

    const result = await deleteLead(rowIndex);

    if (result.success) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json(
        { ok: false, message: result.error || "삭제 실패" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[admin/records DELETE] Error:", error);
    return NextResponse.json(
      { ok: false, message: "삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
