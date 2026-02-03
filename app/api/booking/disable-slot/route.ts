import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error("Missing Google credentials");
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

/**
 * 시간대 용량을 0으로 설정 (비활성화)
 * POST /api/booking/disable-slot
 * Body: { date: "2026-02-15", time: "14:00" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json(
        { ok: false, message: "date와 time이 필요합니다" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const leadSheetName = process.env.GOOGLE_SHEET_NAME || "시트1";

    if (!spreadsheetId) {
      return NextResponse.json(
        { ok: false, message: "Missing GOOGLE_SHEET_ID" },
        { status: 500 }
      );
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // 1. 해당 날짜/시간에 확정 또는 대기 예약이 있는지 확인
    const leadsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${leadSheetName}!A:K`,
    });

    const leadsRows = leadsResponse.data.values || [];
    const hasActiveBookings = leadsRows.slice(1).some((row) => {
      const bookingDate = row[4];
      const bookingTime = row[5];
      const status = row[9];
      return (
        bookingDate === date &&
        bookingTime === time &&
        (status === "확정" || status === "대기")
      );
    });

    if (hasActiveBookings) {
      return NextResponse.json(
        {
          ok: false,
          message: "확정 또는 대기 중인 예약이 있어 비활성화할 수 없습니다",
        },
        { status: 400 }
      );
    }

    // 2. 예약가능시간 시트에서 해당 행 찾기
    const availableResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "예약가능시간!A:C",
    });

    const availableRows = availableResponse.data.values || [];
    let targetRowIndex = -1;

    for (let i = 1; i < availableRows.length; i++) {
      const row = availableRows[i];
      if (row[0] === date && row[1] === time) {
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

    // 3. 용량을 0으로 변경
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `예약가능시간!C${targetRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["0"]],
      },
    });

    console.log(`[disable-slot] ${date} ${time} 비활성화 완료`);

    return NextResponse.json({
      ok: true,
      message: "시간대가 비활성화되었습니다",
    });
  } catch (error: any) {
    console.error("[disable-slot] Error:", error);
    return NextResponse.json(
      { ok: false, message: "시간대 비활성화 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
