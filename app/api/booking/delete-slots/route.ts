import { NextRequest, NextResponse } from "next/server";
import { deleteTimeSlots } from "../../../../lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const { slots } = await request.json();

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { ok: false, message: "삭제할 일정을 선택해주세요" },
        { status: 400 }
      );
    }

    await deleteTimeSlots(slots);

    return NextResponse.json({
      ok: true,
      deleted: slots.length,
    });
  } catch (error: any) {
    console.error("[delete-slots] Error:", error);
    return NextResponse.json(
      { ok: false, message: "일정 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
