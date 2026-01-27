/**
 * HTML 이메일 템플릿 생성
 */

interface EmailTemplateData {
  name: string;
  phone: string;
  region: string;
  message: string;
  createdAt: string; // ISO 문자열
  downloadToken?: string; // 다운로드 링크용 토큰
}

/**
 * KST 날짜/시간 포맷팅
 */
function formatKSTDateTime(isoString: string): string {
  const date = new Date(isoString);
  const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Seoul",
  });

  const parts = kstFormatter.formatToParts(date);
  const result: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    result[type] = value;
  });

  return `${result.year}-${result.month}-${result.day} ${result.hour}:${result.minute} (KST)`;
}

/**
 * 문의 내용의 줄바꿈을 <br/> 태그로 변환
 */
function escapeAndFormatMessage(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
    )
    .join("<br />");
}

/**
 * HTML 이메일 템플릿 생성
 */
export function generateEmailTemplate(data: EmailTemplateData): string {
  const {
    name,
    phone,
    region,
    message,
    createdAt,
    downloadToken,
  } = data;

  const formattedTime = formatKSTDateTime(createdAt);
  const formattedMessage = escapeAndFormatMessage(message);
  const downloadLink = downloadToken
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/records/download?token=${downloadToken}`
    : "";

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>창업 문의 알림</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <!-- 헤더 -->
    <div style="background: linear-gradient(135deg, #ff7a00 0%, #ff8c1a 100%); padding: 24px; text-align: center;">
      <div style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
        메타페이
      </div>
    </div>

    <!-- 콘텐츠 -->
    <div style="padding: 32px;">
      <!-- 타이틀 -->
      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #333333;">
        [창업문의] 새 문의가 도착했어요
      </h1>

      <!-- 접수일시 -->
      <div style="margin-bottom: 24px; padding: 12px; background-color: #f9f9f9; border-left: 4px solid #ff7a00; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; color: #666666;">
          <strong>접수일시:</strong> ${formattedTime}
        </p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #999999;">
          (${createdAt})
        </p>
      </div>

      <!-- 입력 데이터 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #333333; width: 100px; font-size: 14px;">
              이름
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; font-size: 14px;">
              ${escapeAndFormatMessage(name)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #333333; width: 100px; font-size: 14px;">
              연락처
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; font-size: 14px;">
              <a href="tel:${phone}" style="color: #ff7a00; text-decoration: none;">
                ${escapeAndFormatMessage(phone)}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #333333; width: 100px; font-size: 14px;">
              지역
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; font-size: 14px;">
              ${escapeAndFormatMessage(region || "-")}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; color: #333333; width: 100px; font-size: 14px; vertical-align: top;">
              문의 내용
            </td>
            <td style="padding: 12px; color: #666666; font-size: 14px; white-space: pre-line; word-wrap: break-word;">
              ${formattedMessage}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- CTA 버튼 -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a
          href="http://pf.kakao.com/_zRMZj/chat"
          style="display: inline-block; padding: 12px 32px; background-color: #ff7a00; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; transition: background-color 0.3s ease;"
        >
          상담하기
        </a>
      </div>

      <!-- 다운로드 링크 -->
      ${
        downloadLink
          ? `
      <div style="text-align: center; margin-bottom: 24px; padding-top: 24px; border-top: 1px solid #eeeeee;">
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999;">
          관리자용: 전체 문의 기록 확인
        </p>
        <a
          href="${downloadLink}"
          style="display: inline-block; padding: 8px 20px; background-color: #f5f5f5; color: #333333; text-decoration: none; border-radius: 8px; border: 1px solid #dddddd; font-size: 13px; font-weight: 500;"
        >
          📥 전체 기록 다운로드 (CSV)
        </a>
      </div>
      `
          : ""
      }
    </div>

    <!-- 푸터 -->
    <div style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eeeeee; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.6;">
        본 메일은 메타페이 창업 문의 폼에서 자동 발송되었습니다.<br />
        이 메일에 직접 회신하지 마시고,<br />
        위의 "상담하기" 버튼을 통해 문의해 주세요.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
