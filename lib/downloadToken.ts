/**
 * 다운로드 토큰 생성 및 검증
 * JWT 기반 토큰으로 24시간 유효 기간 설정
 */

import crypto from "crypto";

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET || "carrot-default-secret-key-change-in-prod";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

interface TokenPayload {
  iat: number; // issued at
  exp: number; // expiration
  type: "download";
}

/**
 * 다운로드 토큰 생성 (간단한 HMAC 방식)
 */
export function generateDownloadToken(): string {
  const now = Date.now();
  const exp = now + TOKEN_EXPIRY_MS;

  const payload: TokenPayload = {
    iat: now,
    exp: exp,
    type: "download",
  };

  // HMAC으로 서명
  const message = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(message)
    .digest("hex");

  // base64로 인코딩
  const token = Buffer.from(`${message}.${signature}`).toString("base64");
  return token;
}

/**
 * 다운로드 토큰 검증
 */
export function verifyDownloadToken(token: string): { valid: boolean; payload?: TokenPayload } {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [messageStr, signature] = decoded.split(".");

    if (!messageStr || !signature) {
      return { valid: false };
    }

    // 서명 검증
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(messageStr)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    // 페이로드 파싱 및 만료 시간 검증
    const payload: TokenPayload = JSON.parse(messageStr);
    if (payload.exp < Date.now()) {
      return { valid: false }; // 만료됨
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
