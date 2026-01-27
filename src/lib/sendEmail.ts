/**
 * 이메일 발송 로직 (텍스트 포맷 단일 소스)
 * - 제목/본문/링크를 이 파일에서만 생성하여 일관성 유지
 */

import { Resend } from "resend";

type LeadEmailPayload = {
  name: string;
  phone: string;
  region?: string;
  message?: string;
  createdAt?: string | Date;
};

function formatKSTDateTime(date: Date): string {
  const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  const parts = kstFormatter.formatToParts(date);
  const result: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    result[type] = value;
  });

  return `${result.year}-${result.month}-${result.day}-${result.weekday} ${result.hour}:${result.minute}`;
}

function buildSubject(): string {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || "문의";
  return `[${companyName}] 새 문의 도착`;
}

function buildTextBody(payload: LeadEmailPayload): string {
  const createdDate = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const formattedTime = formatKSTDateTime(createdDate);
  const kakaoLink = process.env.KAKAO_CHAT_URL || "http://pf.kakao.com/_zRMZj/chat";
  const sheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "";

  const sheetViewUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : "(구글시트 ID 미설정)";
  const sheetCsvUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv` : "(구글시트 ID 미설정)";

  // 고정 양식: 빈 값도 항상 표시
  let text = "";
  text += `접수 일시 : ${formattedTime}\n`;
  text += `이름      : ${payload.name || "(미입력)"}\n`;
  text += `연락처    : ${payload.phone || "(미입력)"}\n`;
  text += `지역      : ${payload.region || "(미입력)"}\n`;
  text += `문의 내용 : ${payload.message || "(미입력)"}\n`;
  text += "\n";
  text += "====================================\n";
  text += "[상담하기]\n";
  text += `카카오톡 채팅: ${kakaoLink}\n`;
  text += "\n";
  text += "[구글시트]\n";
  text += `보기: ${sheetViewUrl}\n`;
  text += `다운로드(CSV): ${sheetCsvUrl}\n`;

  return text;
}

export async function sendLeadNotificationEmail(payload: LeadEmailPayload): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Email] RESEND_API_KEY not set, skipping email");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    // Use only EMAIL_FROM_NAME email, not ADMIN_EMAILS
    const recipientEmail = "info@metapay.co.kr"; // Hardcoded to avoid duplicate sends
    
    const emailFrom = process.env.EMAIL_FROM || "noreply@resend.dev";
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || "문의";

    const subject = buildSubject();
    const text = buildTextBody(payload);

    console.log(`[Email] Sending to: ${recipientEmail} at ${new Date().toISOString()}`);

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: `${companyName} <${emailFrom}>`,
      to: [recipientEmail],
      subject,
      text,
    });

    const endTime = Date.now();
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Preview (200 chars): ${text.slice(0, 200)}`);
    console.log(`[Email] Sent successfully in ${endTime - startTime}ms`);
    console.log(`[Email] Resend response:`, result);
    return { success: true };
  } catch (error) {
    const endTime = Date.now();
    console.error(`[Email] Failed after ${endTime - startTime}ms:`, error);
    return { success: false, error: String(error) };
  }
}