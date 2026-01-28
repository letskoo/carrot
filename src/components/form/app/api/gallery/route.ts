import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/gallery
 * /public/images 폴더의 모든 이미지를 스캔하여 랜덤 순서로 반환
 */
export async function GET() {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images');
    
    // 디렉토리 읽기
    const files = fs.readdirSync(imagesDirectory);
    
    // 이미지 확장자 필터링
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // /images/filename.jpg 형태로 변환
    const imagePaths = imageFiles.map((file) => `/images/${file}`);
    
    // Fisher-Yates shuffle로 랜덤 섞기
    const shuffled = [...imagePaths];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    console.log(`[Gallery API] Found ${shuffled.length} images`);
    
    return NextResponse.json({
      images: shuffled,
      count: shuffled.length,
    });
  } catch (error) {
    console.error('[Gallery API] Error reading images:', error);
    return NextResponse.json(
      { images: [], count: 0, error: 'Failed to load images' },
      { status: 500 }
    );
  }
}
