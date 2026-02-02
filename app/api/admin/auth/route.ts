import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSettings, setupAdminSettingsSheet } from "../../../../lib/googleSheets";

const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "carrot2024";

async function getAdminPassword(): Promise<string> {
  try {
    await setupAdminSettingsSheet();
    const settings = await getAdminSettings();
    const rawPassword = settings?.password;

    if (!rawPassword) {
      return DEFAULT_PASSWORD;
    }

    return String(rawPassword).replace(/^'+/, "");
  } catch (error) {
    console.error("Failed to get admin password from sheet:", error);
    return DEFAULT_PASSWORD;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { ok: false, message: "비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    // 구글 시트에서 저장된 비밀번호 가져오기
    const storedPassword = await getAdminPassword();

    // 비밀번호 검증
    if (password !== storedPassword) {
      return NextResponse.json(
        { ok: false, message: "비밀번호가 일치하지 않습니다" },
        { status: 401 }
      );
    }

    // 토큰 생성 (간단한 방식)
    const token = crypto.randomBytes(32).toString("hex");

    // 실제로는 Redis나 DB에 저장해야 하지만,
    // 간단하게 구현하기 위해 클라이언트에서 localStorage로 관리
    // (프로덕션에서는 보안을 위해 서버 세션 사용 권장)

    return NextResponse.json({
      ok: true,
      token,
      message: "로그인 성공",
    });
  } catch (error) {
    console.error("[admin/auth] Error:", error);
    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "POST /api/admin/auth로 비밀번호를 전송하세요",
      example: {
        method: "POST",
        body: {
          password: "your_password",
        },
      },
    },
    { status: 200 }
  );
}
