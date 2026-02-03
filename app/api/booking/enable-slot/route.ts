import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const { date, time, capacity } = await request.json();

    if (!date || !time) {
      return NextResponse.json(
        { ok: false, message: "날짜와 시간을 입력해주세요" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        { ok: false, message: "Missing GOOGLE_SHEET_ID" },
        { status: 500 }
      );
    }

    const sheets = getSheetsClient();

    // 예약가능시간 시트에서 해당 날짜+시간 행 찾기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "예약가능시간!A:C",
    });

    const rows = response.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === date && rows[i][1] === time) {
        targetRowIndex = i + 1; // 1-based index
        break;
      }
    }

    if (targetRowIndex === -1) {
      return NextResponse.json(
        { ok: false, message: "해당 시간대를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // capacity를 지정된 값으로 설정 (기본값 1)
    const newCapacity = capacity || "1";
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `예약가능시간!C${targetRowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newCapacity]],
      },
    });

    return NextResponse.json({
      ok: true,
      message: "시간대가 활성화되었습니다",
    });
  } catch (error) {
    console.error("[enable-slot] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "서버 오류",
      },
      { status: 500 }
    );
  }
}
