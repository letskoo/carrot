import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, region, memo } = body || {};

    // ✅ 최소 검증 (필수값)
    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, message: "name, phone is required" },
        { status: 400 }
      );
    }

    // ✅ .env.local 에 넣은 Apps Script URL
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      return NextResponse.json(
        { ok: false, message: "Missing NEXT_PUBLIC_GOOGLE_SCRIPT_URL" },
        { status: 500 }
      );
    }

    // ✅ Apps Script로 전달할 payload
    const payload = {
      name,
      phone,
      region: region || "",
      memo: memo || "",
      createdAt: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "",
    };

    // ✅ Apps Script로 POST 전송
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 캐시 방지
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, message: "Google Script error", detail: text },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({}));

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
