import fs from 'fs';
import path from 'path';

/**
 * /public/images 폴더의 모든 이미지 파일을 자동으로 스캔하여 반환
 * 파일 추가/삭제 시 코드 수정 없이 자동 반영됨
 */
export function getGalleryImages(): string[] {
  const imagesDirectory = path.join(process.cwd(), 'public', 'images');
  
  try {
    // 디렉토리 읽기
    const files = fs.readdirSync(imagesDirectory);
    
    // 이미지 확장자 필터링
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // 파일명 기준 정렬 (숫자 포함 자연스러운 정렬)
    const sortedFiles = imageFiles.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    // /images/filename.jpg 형태로 변환
    return sortedFiles.map((file) => `/images/${file}`);
  } catch (error) {
    console.error('Error reading gallery images:', error);
    return [];
  }
}
