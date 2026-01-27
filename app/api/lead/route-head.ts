import { NextResponse } from "next/server";
import { sendLeadNotificationEmail } from "@/lib/sendEmail";

// 선택적 기능 플래그
const ENABLE_LOCAL_RECORDS = false; // 로컬 저장 비활성화 (우선순위 낮음)
const ENABLE_EMAIL_NOTIFICATIONS = true; // 이메일 발송 활성화

// Helper to safely log environment variable status
function logEnvStatus(varName: string) {
  const value = process.env[varName];
  if (!value) {
    console.log(`[API] ${varName}: NOT SET`);
    return false;
  }
  // Log that it exists, but not the full URL for security
  console.log(`[API] ${varName}: SET (length: ${value.length})`);
  return true;
}
