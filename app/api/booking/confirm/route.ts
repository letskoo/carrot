import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const BOOKING_CONFIRM_SECRET = process.env.BOOKING_CONFIRM_SECRET || "carrot-booking-secret";

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
 * 예약 확정 API
 * 
 * GET: 이메일 링크에서 바로 확정
 *   http://localhost:3000/api/booking/confirm?rowIndex=2&secret=xxx
 * 
 * POST: 프로그래매틱 확정
 *   {
 *     "rowIndex": 2,
 *     "secret": "xxx"
 *   }
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rowIndex = searchParams.get("rowIndex");
    const secret = searchParams.get("secret");

    // 파라미터 검증
    if (!rowIndex || !secret) {
      return NextResponse.json(
        { ok: false, message: "rowIndex and secret are required" },
        { status: 400 }
      );
    }

    // 보안 검증
    if (secret !== BOOKING_CONFIRM_SECRET) {
      return NextResponse.json(
        { ok: false, message: "Invalid secret" },
        { status: 403 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "carrot";

    if (!spreadsheetId) {
      return NextResponse.json(
        { ok: false, message: "Missing GOOGLE_SHEET_ID" },
        { status: 500 }
      );
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // J열(상태)을 "확정"으로 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!J${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["확정"]],
      },
    });

    console.log(`[booking/confirm] GET: Row ${rowIndex} status updated to 확정`);

    // HTML 응답 (이메일 링크용)
    return new NextResponse(
      `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>예약 확정</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: white;
              padding: 1rem;
              animation: fadeIn 0.3s ease-out;
            }
            .container {
              text-align: center;
              max-width: 400px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .icon-wrapper {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: #7c3aed;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.25rem;
              animation: scaleIn 0.5s ease-out;
            }
            .checkmark {
              width: 20px;
              height: 20px;
              color: white;
              stroke: white;
              stroke-width: 3;
              fill: none;
            }
            h1 {
              color: #111827;
              font-size: 1.25rem;
              font-weight: 700;
              margin: 0 0 0.25rem 0;
              line-height: 1.6;
            }
            .subtitle {
              color: #6b7280;
              font-size: 0.9375rem;
              margin: 0.5rem 0 0 0;
              line-height: 1.5;
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scaleIn {
              from {
                transform: scale(0);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon-wrapper">
              <svg class="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1>예약이 확정되었습니다!</h1>
            <p class="subtitle">고객에게 문자로 알림을 발송해주세요</p>
          </div>
        </body>
        </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  } catch (error: any) {
    console.error("[booking/confirm] Error:", error);
    return new NextResponse(
      `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <title>오류</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ 오류가 발생했습니다</h1>
            <p>예약 확정에 실패했습니다.</p>
          </div>
        </body>
        </html>
      `,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, secret } = body;

    // 보안 검증
    if (secret !== BOOKING_CONFIRM_SECRET) {
      return NextResponse.json(
        { ok: false, message: "Invalid secret" },
        { status: 403 }
      );
    }

    if (!rowIndex) {
      return NextResponse.json(
        { ok: false, message: "rowIndex is required" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "carrot";

    if (!spreadsheetId) {
      return NextResponse.json(
        { ok: false, message: "Missing GOOGLE_SHEET_ID" },
        { status: 500 }
      );
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // J열(상태)을 "확정"으로 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!J${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["확정"]],
      },
    });

    console.log(`[booking/confirm] POST: Row ${rowIndex} status updated to 확정`);

    return NextResponse.json({
      ok: true,
      message: "예약이 확정되었습니다.",
    });
  } catch (error: any) {
    console.error("[booking/confirm] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to confirm booking" },
      { status: 500 }
    );
  }
}
