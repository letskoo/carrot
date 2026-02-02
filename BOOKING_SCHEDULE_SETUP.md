# Google Form + Google Apps Script 자동화 설정 가이드

## 📋 Step 1: Google Form 생성

1. **Google Form 접속**: https://forms.google.com
2. **새 설문 생성** 클릭
3. **제목**: "포토부스 예약 일정 설정" (원하는 제목으로 변경)
4. **다음 항목들 추가**:

### 필수 입력 항목:

#### 1️⃣ 예약 시작일
- **유형**: 날짜
- **필수**: 체크
- **입력 형식**: YYYY-MM-DD (예: 2026-02-10)

#### 2️⃣ 예약 종료일
- **유형**: 날짜
- **필수**: 체크
- **입력 형식**: YYYY-MM-DD (예: 2027-02-10)

#### 3️⃣ 평일(월-금) 최대 용량
- **유형**: 단답형 또는 숫자
- **필수**: 체크
- **예시**: 3

#### 4️⃣ 평일 운영 시간
- **유형**: 단답형
- **필수**: 체크
- **예시**: 10:00,12:00,14:00,16:00,18:00,20:00
- **설명**: 쉼표로 구분된 시간 형식

#### 5️⃣ 주말(토-일) 최대 용량
- **유형**: 단답형 또는 숫자
- **필수**: 체크
- **예시**: 2

#### 6️⃣ 주말 운영 시간
- **유형**: 단답형
- **필수**: 체크
- **예시**: 14:00,16:00,18:00,20:00
- **설명**: 쉼표로 구분된 시간 형식

---

## 🔧 Step 2: Google Apps Script 연동

### Option A: 자동 웹훅 (권장)

Google Form이 제출될 때마다 자동으로 `/api/booking/generate-schedule` API를 호출합니다.

**Google Sheets에 Script 추가:**

1. **Google Sheets 열기** (예약 관리용)
2. **메뉴 → 확장프로그램 → Apps Script** 클릭
3. **다음 코드 복사 & 붙여넣기**:

```javascript
// 폼 제출 시 자동 호출
function onFormSubmit(e) {
  try {
    // Form 응답 파싱
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();

    const responses = {};
    itemResponses.forEach(function(itemResponse, index) {
      responses['field_' + index] = itemResponse.getResponse();
    });

    console.log('Form submitted:', responses);

    // 필드 순서대로 매핑 (위에서 추가한 순서대로)
    const settings = {
      startDate: responses.field_0,           // 예약 시작일
      endDate: responses.field_1,             // 예약 종료일
      weekdayCapacity: responses.field_2,     // 평일 용량
      weekdayTimes: responses.field_3,        // 평일 시간
      weekendCapacity: responses.field_4,     // 주말 용량
      weekendTimes: responses.field_5,        // 주말 시간
    };

    // API 호출
    const url = 'http://localhost:3000/api/booking/generate-schedule'; // 프로덕션 배포 시 변경
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(settings),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    console.log('API response:', result);
    
    if (result.ok) {
      Logger.log('✅ 성공: ' + result.message);
    } else {
      Logger.log('❌ 실패: ' + result.message);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
  }
}

// Form 제출 트리거 설정
function setupFormSubmitTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}
```

4. **`setupFormSubmitTrigger()` 함수 실행**:
   - 화면 상단의 함수 선택 드롭다운에서 `setupFormSubmitTrigger` 선택
   - ▶ 실행 버튼 클릭
   - 권한 승인

---

### Option B: 수동으로 실행

필요할 때마다 관리자가 수동으로 API를 호출합니다.

**방법 1: cURL 명령어**

```bash
curl -X POST http://localhost:3000/api/booking/generate-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-02-10",
    "endDate": "2027-02-10",
    "weekdayCapacity": 3,
    "weekdayTimes": "10:00,12:00,14:00,16:00,18:00,20:00",
    "weekendCapacity": 2,
    "weekendTimes": "14:00,16:00,18:00,20:00"
  }'
```

**방법 2: Postman**

1. POST 요청 생성
2. URL: `http://localhost:3000/api/booking/generate-schedule`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "startDate": "2026-02-10",
  "endDate": "2027-02-10",
  "weekdayCapacity": 3,
  "weekdayTimes": "10:00,12:00,14:00,16:00,18:00,20:00",
  "weekendCapacity": 2,
  "weekendTimes": "14:00,16:00,18:00,20:00"
}
```

---

## 🧪 테스트

### Step 1: API 테스트
```
GET /api/booking/generate-schedule
```
응답:
```json
{
  "ok": true,
  "message": "POST 요청으로 예약 시간대를 생성하세요",
  "example": { ... }
}
```

### Step 2: Google Form으로 테스트
1. Google Form 제출
2. 자동으로 Google Sheets의 "예약가능시간" 시트가 업데이트됨
3. Apps Script 로그 확인: **확장프로그램 → Apps Script → 실행 로그**

---

## 📝 주의사항

1. **로컬 테스트**: `localhost:3000`은 인터넷에서 접근 불가능하므로, **배포 후 URL 변경 필요**
   - 프로덕션: `https://your-domain.com/api/booking/generate-schedule`

2. **기존 데이터 삭제**: 새로 생성할 때마다 기존 "예약가능시간" 데이터가 모두 삭제됩니다

3. **날짜 형식**: `YYYY-MM-DD` 형식 필수 (예: 2026-02-10)

4. **시간 형식**: `HH:MM` 형식으로 쉼표로 구분 (예: 10:00,12:00,14:00)

---

## 🎯 흐름도

```
Google Form 제출
       ↓
Google Apps Script 자동 호출
       ↓
/api/booking/generate-schedule POST 요청
       ↓
generateBookingTimesFromSettings() 실행
       ↓
Google Sheets "예약가능시간" 시트 업데이트
       ↓
완료! 예약 달력에 새 시간대 반영됨
```

---

## 💡 예제

### 입력값:
- 시작일: 2026-02-15
- 종료일: 2026-03-15
- 평일 용량: 3
- 평일 시간: 10:00,12:00,14:00,16:00,18:00,20:00
- 주말 용량: 2
- 주말 시간: 14:00,16:00,18:00,20:00

### 생성 결과:
- 2월 15일~3월 15일 (총 29일)
- 각 평일: 6개 시간대 × 3 용량 = 18개 슬롯
- 각 주말: 4개 시간대 × 2 용량 = 8개 슬롯
- **총 약 700+ 예약 슬롯 자동 생성!** 🎉
