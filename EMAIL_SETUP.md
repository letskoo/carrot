# 이메일 및 다운로드 기능 설정 가이드

## 필수 환경 변수

`.env.local` 또는 `.env` 파일에 다음을 추가하세요:

### 1. 관리자 이메일
```
ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
```

### 2. Resend API (이메일 발송)
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Resend 가입: https://resend.com

### 3. 사이트 URL (다운로드 링크 생성용)
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# 프로덕션: https://yourdomain.com
```

### 4. 다운로드 토큰 시크릿 (선택사항, 기본값 사용 시)
```
DOWNLOAD_TOKEN_SECRET=your-secret-key-change-in-production
```

## 기능 설명

### 1. 이메일 알림
- **구성**: HTML 이메일 템플릿 (로고 + 테이블 + CTA 버튼)
- **발송 시점**: 폼 제출 직후
- **수신자**: ADMIN_EMAIL
- **포함 정보**:
  - 접수 날짜/시간 (KST)
  - 신청자 정보 (이름, 연락처, 지역, 문의 내용)
  - CTA 버튼: "상담하기" (카카오톡)
  - 다운로드 링크: "전체 기록 다운로드"

### 2. 로컬 기록 저장
- **위치**: `.data/leads.json`
- **형식**: JSON 배열
- **포함 정보**: id, name, phone, region, message, createdAt, userAgent

### 3. 다운로드 API
- **엔드포인트**: `/api/admin/records/download?token={token}`
- **인증**: HMAC-SHA256 기반 토큰 (24시간 유효)
- **응답**: CSV 파일
- **칼럼**: ID, 이름, 연락처, 지역, 문의내용, 접수일시

## 테스트

### 1. 로컬 테스트
```bash
npm run dev
# http://localhost:3000 에서 폼 제출
# .data/leads.json 확인
```

### 2. 이메일 테스트
Resend API 설정 후 폼 제출 시 이메일이 ADMIN_EMAIL로 발송됩니다.

### 3. 다운로드 테스트
이메일 하단의 "전체 기록 다운로드" 링크 클릭 또는:
```
GET /api/admin/records/download?token={이메일에서 생성된 토큰}
```

## 프로덕션 배포 시

1. **환경 변수 설정**
   - Vercel/Netlify: Settings → Environment Variables
   - 혹은 `.env.production` 파일 사용

2. **데이터베이스 업그레이드** (선택사항)
   - 현재는 JSON 파일 기반
   - 프로덕션에서는 SQLite/PostgreSQL 사용 권장
   - `lib/leadRecords.ts` 수정 필요

3. **토큰 시크릿 변경**
   ```
   DOWNLOAD_TOKEN_SECRET=your-production-secret-key
   ```

4. **사이트 URL 업데이트**
   ```
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

## 파일 구조

```
app/
  api/
    lead/
      route.ts (수정됨 - 레코드 저장 + 이메일 발송)
    admin/
      records/
        download/
          route.ts (새로 추가)

lib/
  emailTemplate.ts (새로 추가 - HTML 이메일 템플릿)
  downloadToken.ts (새로 추가 - 토큰 생성/검증)
  leadRecords.ts (새로 추가 - 기록 저장/조회)
  sendEmail.ts (새로 추가 - 메일 발송)
```

## 문제 해결

### 이메일이 발송되지 않음
1. `ADMIN_EMAIL` 설정 확인
2. `RESEND_API_KEY` 설정 확인
3. 서버 로그 확인: `[Email]` 검색

### 다운로드 토큰 오류
1. 토큰 URL 확인 (유효한 토큰인지)
2. 토큰 만료 여부 확인 (24시간)
3. 시간 동기화 확인 (서버 시간과 클라이언트 시간)

### 레코드가 저장되지 않음
1. `.data/` 디렉토리 권한 확인
2. 디스크 용량 확인
3. 서버 로그 확인: `[API/POST]` 검색
