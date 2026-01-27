/**
 * 문의 기록 다운로드 API
 * 현재 비활성화 상태 (빌드 에러 해결)
 */

import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Feature not yet enabled" },
    { status: 503 }
  );
}
