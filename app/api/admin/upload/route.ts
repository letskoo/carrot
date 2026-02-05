
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 20;
const BUCKET_NAME = "carrot-images";
const KEY_PATH = path.join(process.cwd(), "secrets", "service-account.json");

const storage = new Storage({ keyFilename: KEY_PATH });
const bucket = storage.bucket(BUCKET_NAME);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { ok: false, message: "업로드할 파일이 없습니다" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { ok: false, message: `최대 ${MAX_FILES}개 파일만 업로드 가능합니다` },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          errors.push(`${file.name}: ${MAX_FILE_SIZE_MB}MB 초과`);
          continue;
        }

        // 파일을 임시로 저장
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(file.name) || ".jpg";
        const gcsFileName = `${uuidv4()}${ext}`;
        // Windows 호환 임시 디렉토리 사용
        const os = await import("os");
        const tempDir = os.tmpdir();
        const tempPath = path.join(tempDir, gcsFileName);
        fs.writeFileSync(tempPath, buffer);

        // GCS에 업로드
        await bucket.upload(tempPath, {
          destination: gcsFileName,
          public: false, // 비공개 업로드
        });

        // 업로드 후 임시 파일 삭제
        fs.unlinkSync(tempPath);

        // signed URL 생성 (1시간 유효)
        const [url] = await bucket.file(gcsFileName).getSignedUrl({
          action: "read",
          expires: Date.now() + 60 * 60 * 1000,
        });
        uploadedUrls.push(url);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `모든 파일 업로드 실패: ${errors.join(", ")}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length}개 파일이 업로드되었습니다`,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (error: any) {
    console.error("[admin/upload] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "서버 오류가 발생했습니다",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "POST /api/admin/upload로 이미지를 업로드하세요",
      requirements: {
        maxFileSize: `${MAX_FILE_SIZE_MB}MB`,
        maxFiles: MAX_FILES,
        format: "FormData with 'files' field",
      },
    },
    { status: 200 }
  );
}
