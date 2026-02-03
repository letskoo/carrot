import { NextResponse } from "next/server";
import { buildAdminConfirmEmail } from "../../../src/lib/sendEmail";
import { getLastRowIndex, appendLeadToSheet, getAdminSettings } from "../../../lib/googleSheets";

// 선택적 기능 플래그 (환경변수 기반)
const ENABLE_LOCAL_RECORDS = false; // 로컬 저장 비활성화 (우선순위 낮음)
const ENABLE_EMAIL_NOTIFICATIONS = process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false"; // 이메일 발송 활성화 (기본: true, 환경변수로 제어)

// Helper to safely log environment variable status
function logEnvStatus(varName: string) {
  const value = process.env[varName];
  if (!value) {
    console.log(`[API]  ${varName}: NOT SET`);
    return false;
  }
  // Log that it exists, but not the full URL for security
  console.log(`[API]  ${varName}: SET (length: ${value.length})`);
  return true;
}

export async function GET(req: Request) {
  // Health check endpoint - verify config without processing data
  const scriptUrlExists = !!process.env.GOOGLE_SCRIPT_URL || !!process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  
  console.log("[API/GET] Health check requested");
  console.log("[API/GET] GOOGLE_SCRIPT_URL:", process.env.GOOGLE_SCRIPT_URL ? "SET" : "NOT SET");
  console.log("[API/GET] NEXT_PUBLIC_GOOGLE_SCRIPT_URL:", process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ? "SET" : "NOT SET");
  
  return NextResponse.json(
    {
      ok: true,
      message: "Health check OK",
      envConfigured: scriptUrlExists,
      availableEnvVars: {
        GOOGLE_SCRIPT_URL: !!process.env.GOOGLE_SCRIPT_URL,
        NEXT_PUBLIC_GOOGLE_SCRIPT_URL: !!process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL,
      },
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    console.log("[API/POST] Form submission received");
    
    const body = await req.json();
    const { name, phone, region, memo, message, bookingDate, bookingTime } = body || {};

    console.log("[API/POST] Incoming form data:", body);
    console.log("[API/POST] Request payload keys:", Object.keys(body || {}));

    //  Validate required fields
    if (!name || !phone) {
      console.warn("[API/POST]  Validation failed: missing name or phone");
      return NextResponse.json(
        { ok: false, message: "name and phone are required" },
        { status: 400 }
      );
    }

    console.log("[API/POST]  Validation passed: name and phone present");

    // 예약 정보가 있으면 용량 확인
    if (bookingDate && bookingTime) {
      try {
        const { getAvailableTimeSlots } = await import("../../../lib/googleSheets");
        const slotResult = await getAvailableTimeSlots(bookingDate);
        
        if (slotResult.success && slotResult.availableSlots) {
          const selectedSlot = slotResult.availableSlots.find(
            (s: any) => s.time === bookingTime
          );
          
          if (!selectedSlot || !selectedSlot.available) {
            console.warn("[API/POST] Booking failed: Slot capacity exceeded");
            return NextResponse.json(
              { 
                ok: false, 
                message: "죄송합니다. 해당 시간이 마감되었습니다. 다른 시간을 선택해주세요." 
              },
              { status: 409 }
            );
          }
        }
      } catch (err) {
        console.warn("[API/POST] Failed to check slot availability:", err);
        // 계속 진행 (구글 시트 확인 실패 시 진행)
      }
    }

    console.log("[API/POST]  Slot availability check passed");

    // ============================================
    // 데이터를 Google Sheets에 직접 저장
    // ============================================
    const sheetName = process.env.GOOGLE_SHEET_NAME || "carrot";
    
    // 전화번호 포맷 안전장치: 숫자만 11자리면 010-xxxx-xxxx 형식으로 변환
    let formattedPhone = phone;
    if (/^\d{11}$/.test(phone)) {
      // 숫자만 11자리인 경우
      formattedPhone = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`;
      console.log("[API/POST] Phone formatted from", phone, "to", formattedPhone);
    } else if (!/^010-\d{4}-\d{4}$/.test(phone)) {
      // 하이픈 형식도 아니면 경고 로그
      console.warn("[API/POST] Phone format unexpected:", phone);
    }

    const leadData = {
      createdAt: new Date().toISOString(),
      name,
      phone: formattedPhone,
      region: region || "",
      memo: message || memo || "",
      userAgent: req.headers.get("user-agent") || "",
      referer: req.headers.get("referer") || "",
      bookingDate: bookingDate || "",
      bookingTime: bookingTime || "",
      status: "대기",
    };

    console.log("[API/POST] Saving lead data to Google Sheets:", {
      name: leadData.name,
      phone: leadData.phone,
      bookingDate: leadData.bookingDate,
      bookingTime: leadData.bookingTime,
    });

    const saveResult = await appendLeadToSheet(leadData);
    if (!saveResult.success) {
      console.error("[API/POST] Failed to save to Google Sheets:", saveResult.error);
      return NextResponse.json(
        { ok: false, message: "Failed to save booking data" },
        { status: 500 }
      );
    }

    console.log("[API/POST] ✅ Data saved to Google Sheets successfully");

    // ============================================
    // 선택적 기능 (이메일 발송)
    // ============================================

    // 예약 확정 이메일 발송 (관리자용)
    if (ENABLE_EMAIL_NOTIFICATIONS && bookingDate && bookingTime) {
      try {
        console.info("[API/POST] Sending admin confirmation email...");

        // 마지막 행 인덱스 조회
        const rowIndexResult = await getLastRowIndex();
        const rowIndex = rowIndexResult.rowIndex || 0;

        // 관리자 설정에서 SMS 커스텀 메시지 가져오기
        const settings = await getAdminSettings();
        const smsCustomMessage = settings?.smsCustomMessage || "예약일에 만나요! :)";

        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const confirmEmail = buildAdminConfirmEmail({
          name,
          phone: formattedPhone,
          region: region || "",
          message: message || memo || "",
          bookingDate,
          bookingTime,
          createdAt: new Date(),
          rowIndex,
          smsCustomMessage,
        });

        const result = await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME || "포토부스"} <${process.env.EMAIL_FROM || "noreply@resend.dev"}>`,
          to: [process.env.COMPANY_RECEIVER_EMAIL || ""],
          subject: confirmEmail.subject,
          text: confirmEmail.text,
          html: confirmEmail.html,
        });

        console.info("[API/POST] ✅ Admin confirmation email sent");
      } catch (err) {
        console.warn("[API/POST] ⚠️ Admin confirmation email send failed:", err);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (e: any) {
    console.error("[API/POST]  EXCEPTION:", e?.message || String(e));
    console.error("[API/POST] Stack:", e?.stack);
    
    return NextResponse.json(
      { ok: false, message: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
