import { NextRequest, NextResponse } from "next/server";

const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "carrot_images";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "your-cloud-name";
const MAX_FILE_SIZE_MB = 5; // 5MB per file
const MAX_FILES = 20;

/**
 * POST /api/admin/upload
 * FormData로 전송된 이미지 파일들을 Cloudinary에 업로드
 */
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

    // 각 파일을 Cloudinary에 업로드
    for (const file of files) {
      try {
        // 파일 크기 확인
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          errors.push(`${file.name}: ${MAX_FILE_SIZE_MB}MB 초과`);
          continue;
        }

        // FormData 생성
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        // Cloudinary API 호출
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: uploadFormData,
          }
        );

        if (!cloudinaryResponse.ok) {
          errors.push(`${file.name}: 업로드 실패`);
          continue;
        }

        const cloudinaryData = await cloudinaryResponse.json();

        if (cloudinaryData.secure_url) {
          uploadedUrls.push(cloudinaryData.secure_url);
        } else {
          errors.push(`${file.name}: 응답 오류`);
        }
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
