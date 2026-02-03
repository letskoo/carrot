import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSettings,
  updateAdminSetting,
  setupAdminSettingsSheet,
  AdminSettings,
} from "../../../../lib/googleSheets";

/**
 * GET /api/admin/settings
 * 현재 관리자 설정값 조회
 */
export async function GET(request: NextRequest) {
  try {
    // setupAdminSettingsSheet() 제거 - 이미 설정되어 있고, quota 낭비
    const settings = await getAdminSettings();

    // settings가 null이어도 빈 객체로 반환 (초기 로드 시)
    return NextResponse.json({
      ok: true,
      settings: settings || {},
    });
  } catch (error: any) {
    console.error("[admin/settings] GET Error:", error);
    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * 관리자 설정값 업데이트
 *
 * Body:
 * {
 *   "key": "mainTitle",
 *   "value": "새로운 제목"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json(
        { ok: false, message: "key는 필수입니다" },
        { status: 400 }
      );
    }

    const result = await updateAdminSetting(key, value);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, message: result.error || "설정 업데이트 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `${key} 설정이 업데이트되었습니다`,
    });
  } catch (error: any) {
    console.error("[admin/settings] POST Error:", error);
    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * 관리자 설정 시트 초기화 (관리자용)
 */
export async function PUT(request: NextRequest) {
  try {
    await setupAdminSettingsSheet();

    return NextResponse.json({
      ok: true,
      message: "관리자 설정 시트가 준비되었습니다",
    });
  } catch (error: any) {
    console.error("[admin/settings] PUT Error:", error);
    return NextResponse.json(
      { ok: false, message: "시트 초기화 실패" },
      { status: 500 }
    );
  }
}
