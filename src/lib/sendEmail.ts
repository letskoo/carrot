/**
 * 이메일 발송 로직 (텍스트 포맷 단일 소스)
 * - 제목/본문/링크를 이 파일에서만 생성하여 일관성 유지
 */

type LeadEmailPayload = {
  name: string;
  phone: string;
  region?: string;
  message?: string;
  bookingDate?: string;
  bookingTime?: string;
  createdAt?: string | Date;
};

function formatKSTDateTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "narrow",
    timeZone: "Asia/Seoul",
  });

  const parts = formatter.formatToParts(date);
  const result: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    result[type] = value;
  });

  // 형식: YYYY-MM-DD (수) HH:mm
  return `${result.year}-${result.month}-${result.day} (${result.weekday}) ${result.hour}:${result.minute}`;
}


/**
 * 관리자용 예약 확정 이메일
 * - 예약 내용 요약
 * - 바로 확정 버튼 (클릭 시 POST /api/booking/confirm 호출)
 * - 문자 발송 템플릿 (복사 가능)
 */
export function buildAdminConfirmEmail(payload: LeadEmailPayload & { rowIndex: number; smsCustomMessage?: string }): {
  subject: string;
  text: string;
  html: string;
} {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmLink = `${appUrl}/api/booking/confirm?rowIndex=${payload.rowIndex}&secret=${process.env.BOOKING_CONFIRM_SECRET || "carrot-booking-secret"}`;
  const kakaoLink = process.env.KAKAO_CHAT_URL || "http://pf.kakao.com/_zRMZj/chat";
  const sheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "";
  const sheetViewUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : "";
  const sheetCsvUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv` : "";
  
  const smsTemplate = `[포토부스 렌탈]
안녕하세요! 예약이 확정되었습니다.
• 예약자: ${payload.name}
• 날짜: ${payload.bookingDate}
• 시간: ${payload.bookingTime}${payload.smsCustomMessage ? `\n\n${payload.smsCustomMessage}` : ''}`;

  const smsLink = `sms:${payload.phone}?body=${encodeURIComponent(smsTemplate)}`;

  const text = `📅 포토부스 렌탈 예약 확정 안내\n\n` +
    `예약자: ${payload.name}\n` +
    `연락처: ${payload.phone}\n` +
    `예약일시: ${payload.bookingDate} ${payload.bookingTime}\n` +
    `${payload.region ? `지역: ${payload.region}\n` : ""}` +
    `${payload.message ? `요청사항: ${payload.message}\n` : ""}` +
    `\n✅ 빠른 확정 방법\n` +
    `메일 내 버튼을 눌러 예약 확정 및 문자 발송을 진행해주세요.\n` +
    `\n📌 관리자 참고 링크는 HTML 메일에서 확인 가능합니다.`;

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>예약 확정 안내</title>
</head>
<body style="margin:0; padding:24px; background:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif; color:#111827;">
  <div style="max-width:640px; margin:0 auto;">
    <h2 style="font-size:18px; margin:0 0 16px 0; font-weight:700;">📅 포토부스 렌탈 예약 확정 안내</h2>
    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px;">
      <div style="margin-bottom:8px;"><strong>예약자:</strong> ${payload.name}</div>
      <div style="margin-bottom:8px;"><strong>연락처:</strong> ${payload.phone}</div>
      <div style="margin-bottom:8px;"><strong>예약일시:</strong> ${payload.bookingDate} ${payload.bookingTime}</div>
      ${payload.region ? `<div style=\"margin-bottom:8px;\"><strong>지역:</strong> ${payload.region}</div>` : ""}
      ${payload.message ? `<div style=\"margin-bottom:0;\"><strong>요청사항:</strong> ${payload.message}</div>` : ""}
    </div>

    <h3 style="font-size:16px; margin:24px 0 12px 0; font-weight:700;">✅ 빠른 확정 방법</h3>
    <div style="margin-bottom:16px;">
      <div style="margin-bottom:12px;">
        <a href="${confirmLink}" style="display:block; padding:12px 18px; background:#7c3aed; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700; text-align:center;">예약 확정하기</a>
      </div>
      <div>
        <a href="${smsLink}" style="display:block; padding:12px 18px; background:#111827; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700; text-align:center;">문자 앱 열기</a>
      </div>
    </div>
    <p style="margin:0 0 20px 0; color:#6b7280; font-size:13px; line-height:1.5;">
      문자 앱 열기를 누르면 스마트폰 문자 앱에 내용이 자동 입력됩니다.
    </p>

    <h3 style="font-size:16px; margin:24px 0 12px 0; font-weight:700;">📌 관리자 참고 링크</h3>
    <ul style="padding-left:18px; margin:0; color:#374151;">
      ${kakaoLink ? `<li style=\"margin-bottom:8px;\"><a href=\"${kakaoLink}\" style=\"color:#2563eb; text-decoration:none;\">개발회사와 상담하기</a></li>` : ""}
      ${sheetViewUrl ? `<li style=\"margin-bottom:8px;\"><a href=\"${sheetViewUrl}\" style=\"color:#2563eb; text-decoration:none;\">구글시트 바로가기</a></li>` : ""}
      ${sheetCsvUrl ? `<li style=\"margin-bottom:8px;\"><a href=\"${sheetCsvUrl}\" style=\"color:#2563eb; text-decoration:none;\">구글시트 다운로드 (CSV)</a></li>` : ""}
    </ul>
  </div>
</body>
</html>
  `.trim();

  return {
    subject: `[확정필요] 포토부스 예약 신청 - ${payload.name} (${payload.bookingDate} ${payload.bookingTime})`,
    text,
    html,
  };
}