import { google } from "googleapis";

interface LeadRow {
  createdAt: string;
  name: string;
  phone: string;
  region?: string;
  memo?: string;
  userAgent?: string;
  referer?: string;
  bookingDate?: string; // 예약 날짜 (YYYY-MM-DD)
  bookingTime?: string; // 예약 시간 (HH:MM)
  status?: string; // 상태 (대기/확정/거부/취소)
}

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error(
      "Missing GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL in environment"
    );
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

function getSheetsClient() {
  if (!sheetsClient) {
    const auth = getGoogleAuth();
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

export async function appendLeadToSheet(
  lead: LeadRow
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[googleSheets] appendLeadToSheet called with:", {
      name: lead.name,
      phone: lead.phone,
      bookingDate: lead.bookingDate,
      bookingTime: lead.bookingTime,
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "시트1";
    const range = `${sheetName}!A:K`; // 컬럼 확장 (K까지)

    if (!spreadsheetId) {
      const err = "Missing GOOGLE_SHEET_ID environment variable";
      console.error("[googleSheets]", err);
      return { success: false, error: err };
    }

    console.log("[googleSheets] Using spreadsheetId:", spreadsheetId);
    console.log("[googleSheets] Using range:", range);

    const sheets = getSheetsClient();

    const values = [
      [
        lead.createdAt,
        lead.name,
        lead.phone,
        lead.region || "",
        lead.bookingDate || "", // 예약 날짜
        lead.bookingTime || "", // 예약 시간
        lead.memo || "",
        lead.userAgent || "",
        lead.referer || "",
        lead.status || "대기", // 상태 (기본값: 대기)
        "", // 관리자 메모 (빈칸)
      ],
    ];

    console.log("[googleSheets] Appending row:", values[0]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    console.log("[googleSheets] append response.status:", response.status);
    console.log(
      "[googleSheets] append response.data?.updates:",
      response.data?.updates
    );

    const updatedRows = response.data?.updates?.updatedRows || 0;
    const updatedColumns = response.data?.updates?.updatedColumns || 0;

    if (response.status === 200 && updatedRows > 0) {
      console.log(
        `[googleSheets] Success! Added ${updatedRows} row(s), ${updatedColumns} column(s)`
      );
      return { success: true };
    }

    const err = `Google Sheets API returned status ${response.status}, updatedRows=${updatedRows}`;
    console.error("[googleSheets]", err);
    return { success: false, error: err };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const apiError = error?.response?.data?.error?.message;
    const fullErrorMsg = apiError
      ? `${errorMessage} (API: ${apiError})`
      : errorMessage;

    console.error("[googleSheets] Exception caught:", fullErrorMsg);
    if (error instanceof Error && error.stack) {
      console.error("[googleSheets] Stack trace:", error.stack);
    }

    return {
      success: false,
      error: fullErrorMsg,
    };
  }
}

/**
 * 예약 신청 후 Google Sheets에 추가된 행의 인덱스 반환
 */
export async function getLastRowIndex(): Promise<{
  success: boolean;
  rowIndex?: number;
  error?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "시트1";

    if (!spreadsheetId) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" };
    }

    const sheets = getSheetsClient();

    // 시트의 모든 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.length; // 마지막 행의 인덱스 (1-based)

    return { success: true, rowIndex };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[getLastRowIndex] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 구글 시트 자동 초기화 함수
 * - "예약가능시간" 시트 생성
 * - 기존 리드 시트에 헤더 추가/업데이트
 */
export async function setupBookingSheets(): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const leadSheetName = process.env.GOOGLE_SHEET_NAME || "시트1";

    if (!spreadsheetId) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" };
    }

    const sheets = getSheetsClient();

    // 1. 모든 시트 목록 가져오기
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets || [];
    const sheetNames = existingSheets.map((s) => s.properties?.title || "");

    console.log("[setupBookingSheets] Existing sheets:", sheetNames);

    // 2. "예약가능시간" 시트가 없으면 생성
    if (!sheetNames.includes("예약가능시간")) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "예약가능시간",
                },
              },
            },
          ],
        },
      });

      // 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "예약가능시간!A1:C1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["날짜", "시간슬롯", "최대용량"]],
        },
      });

      // 예시 데이터 추가 (향후 2주간)
      const today = new Date();
      const exampleData: string[][] = [];
      
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const dayOfWeek = date.getDay();
        
        // 평일(월-금): 최대용량 3, 시간 10:00~20:00
        // 주말(토-일): 최대용량 2, 시간 14:00~20:00
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const capacity = isWeekend ? 2 : 3;
        const times = isWeekend 
          ? "14:00,16:00,18:00,20:00"
          : "10:00,12:00,14:00,16:00,18:00,20:00";
        
        exampleData.push([dateStr, times, String(capacity)]);
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "예약가능시간!A:B",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: exampleData,
        },
      });

      console.log("[setupBookingSheets] Created '예약가능시간' sheet");
    }

    // 3. 리드 시트 헤더 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${leadSheetName}!A1:K1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            "타임스탬프",
            "이름",
            "연락처",
            "지역",
            "예약날짜",
            "예약시간",
            "문의내용",
            "UserAgent",
            "Referer",
            "상태",
            "관리자메모",
          ],
        ],
      },
    });

    console.log("[setupBookingSheets] Updated lead sheet headers");

    // 4. 상태(J) 컬럼에 드롭다운 데이터 유효성 검사 추가
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              setDataValidation: {
                range: {
                  sheetId: existingSheets.find((s) => s.properties?.title === leadSheetName)?.properties?.sheetId || 0,
                  dimension: "ROWS",
                  startIndex: 1, // 헤더 제외 (2행부터)
                  endIndex: 1000, // 1000행까지
                  startColumnIndex: 9, // J 컬럼 (0부터 시작하므로 9)
                  endColumnIndex: 10,
                },
                rule: {
                  type: "LIST",
                  listCondition: {
                    values: [
                      { userEnteredValue: "대기" },
                      { userEnteredValue: "확정" },
                      { userEnteredValue: "거부" },
                      { userEnteredValue: "취소" },
                    ],
                  },
                  showCustomUi: true,
                },
              },
            },
          ],
        },
      });
      console.log("[setupBookingSheets] Added dropdown validation to 상태 column");
    } catch (err) {
      console.warn("[setupBookingSheets] Failed to add dropdown (non-critical):", err);
    }

    return {
      success: true,
      message: "예약 시스템 시트가 성공적으로 설정되었습니다.",
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[setupBookingSheets] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 특정 날짜의 예약 가능한 시간 슬롯 조회 (용량 포함)
 */
export async function getAvailableTimeSlots(
  date: string
): Promise<{
  success: boolean;
  availableSlots?: Array<{ time: string; booked: number; capacity: number }>;
  error?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" };
    }

    const sheets = getSheetsClient();

    // 1. "예약가능시간" 시트에서 해당 날짜의 시간슬롯과 용량 가져오기
    const availableResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "예약가능시간!A:C",
    });

    const availableRows = availableResponse.data.values || [];
    // 같은 날짜를 가진 모든 행 찾기
    const dateRows = availableRows.filter((row) => row[0] === date);

    if (!dateRows || dateRows.length === 0) {
      return { success: true, availableSlots: [] };
    }

    // 각 행의 B열(시간)과 C열(용량) 추출
    const allSlots = dateRows.map((row) => row[1]).filter((slot) => slot);
    const capacity = parseInt(dateRows[0][2] || "1", 10) || 1;

    // 2. 리드 시트에서 해당 날짜의 예약 현황 확인
    const leadSheetName = process.env.GOOGLE_SHEET_NAME || "시트1";
    const leadsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${leadSheetName}!A:K`,
    });

    const leadsRows = leadsResponse.data.values || [];
    const bookedCount = new Map<string, number>();

    // 헤더 제외하고 데이터 행만 확인
    for (let i = 1; i < leadsRows.length; i++) {
      const row = leadsRows[i];
      const bookingDate = row[4]; // E열: 예약날짜
      const bookingTime = row[5]; // F열: 예약시간
      const status = row[9]; // J열: 상태

      if (
        bookingDate === date &&
        bookingTime &&
        (status === "대기" || status === "확정")
      ) {
        bookedCount.set(bookingTime, (bookedCount.get(bookingTime) || 0) + 1);
      }
    }

    // 3. 용량 정보와 함께 반환
    const availableSlots = allSlots.map((slot: string) => {
      const booked = bookedCount.get(slot) || 0;
      return {
        time: slot,
        booked,
        capacity,
        available: booked < capacity, // 용량이 남았으면 true
      };
    });

    return { success: true, availableSlots };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[getAvailableTimeSlots] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 특정 월의 예약 가능한 날짜 목록 조회
 */
export async function getAvailableDates(
  yearMonth: string // "2026-02" 형식
): Promise<{
  success: boolean;
  dates?: Array<{ date: string; status: "available" | "full" | "partial" }>;
  error?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" };
    }

    const sheets = getSheetsClient();

    // 1. "예약가능시간" 시트에서 해당 월의 날짜들 가져오기
    const availableResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "예약가능시간!A:C",
    });

    const availableRows = availableResponse.data.values || [];
    // 같은 날짜를 가진 모든 시간과 용량 수집
    const dateInfo = new Map<string, { times: Set<string>; capacity: number }>();
    availableRows
      .filter((row) => row[0] && row[0].startsWith(yearMonth))
      .forEach((row) => {
        const date = row[0];
        const time = row[1];
        const capacity = parseInt(row[2] || "1", 10) || 1;
        
        if (!dateInfo.has(date)) {
          dateInfo.set(date, { times: new Set(), capacity });
        }
        if (time) {
          dateInfo.get(date)!.times.add(time);
        }
      });

    if (dateInfo.size === 0) {
      return { success: true, dates: [] };
    }

    // 2. 각 날짜별로 예약 현황 확인
    const leadSheetName = process.env.GOOGLE_SHEET_NAME || "시트1";
    const leadsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${leadSheetName}!A:K`,
    });

    const leadsRows = leadsResponse.data.values || [];
    const bookingsByDate = new Map<string, Set<string>>();

    // 날짜별 예약된 시간 수집
    for (let i = 1; i < leadsRows.length; i++) {
      const row = leadsRows[i];
      const bookingDate = row[4];
      const bookingTime = row[5];
      const status = row[9];

      if (
        bookingDate &&
        bookingTime &&
        (status === "대기" || status === "확정")
      ) {
        if (!bookingsByDate.has(bookingDate)) {
          bookingsByDate.set(bookingDate, new Set());
        }
        bookingsByDate.get(bookingDate)!.add(bookingTime);
      }
    }

    // 3. 각 날짜의 상태 계산
    const dates = Array.from(dateInfo.entries()).map(([date, { times, capacity }]) => {
      const slotCount = times.size;
      // 시간 슬롯이 없으면 선택 불가
      if (slotCount === 0) {
        return { date, status: "full" as const };
      }
      const bookedCount = bookingsByDate.get(date)?.size || 0;
      if (bookedCount === 0) {
        return { date, status: "available" as const };
      }
      if (bookedCount >= slotCount * capacity) {
        return { date, status: "full" as const };
      }
      return { date, status: "partial" as const };
    });

    return { success: true, dates };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[getAvailableDates] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
/**
 * Google Form 응답을 기반으로 예약 가능 시간 자동 생성
 * 관리자가 설정한 기간, 요일별 용량, 시간대를 반영하여 데이터 생성
 */
export async function generateBookingTimesFromSettings(settings: {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  weekdayCapacity: number; // 평일 최대 용량
  weekdayTimes: string; // "10:00,12:00,14:00,..." (쉼표로 구분)
  weekendCapacity: number; // 주말 최대 용량
  weekendTimes: string; // "14:00,16:00,18:00,..." (쉼표로 구분)
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" };
    }

    const sheets = getSheetsClient();
    const sheetName = "예약가능시간";

    // 날짜 파싱
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);

    if (start > end) {
      return { success: false, error: "시작일이 종료일보다 뒤에 있습니다" };
    }

    // 기존 데이터 삭제 (헤더 제외)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A2:C1000`,
    });

    // 새로운 데이터 생성
    const newData: string[][] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // 요일에 따라 용량과 시간 설정
      const capacity = isWeekend
        ? settings.weekendCapacity
        : settings.weekdayCapacity;
      const times = isWeekend
        ? settings.weekendTimes
        : settings.weekdayTimes;

      // 각 시간마다 행 생성
      const timeList = times.split(",").map((t) => t.trim());
      for (const time of timeList) {
        newData.push([dateStr, time, String(capacity)]);
      }

      // 다음 날짜로
      current.setDate(current.getDate() + 1);
    }

    // 데이터 일괄 추가
    if (newData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A2`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: newData,
        },
      });

      console.log(
        `[generateBookingTimesFromSettings] Generated ${newData.length} booking time slots`
      );
    }

    return {
      success: true,
      message: `${newData.length}개의 예약 시간대가 생성되었습니다.`,
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[generateBookingTimesFromSettings] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ========================
// 관리자 설정 함수들
// ========================

export interface AdminSettings {
  password: string;
  mainTitle: string;
  mainSubtitle: string;
  applicationItem: string;
  companyName: string;
  ctaButtonText: string;
  formTitle: string;
  heroImageUrls: string[]; // 최대 20개
  profileImageUrl: string;
  profileName: string;
  benefits: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  consentDetails: {
    personalDataCollection: {
      title: string;
      subtitle: string;
      body: string;
    };
    personalDataThirdParty: {
      title: string;
      subtitle: string;
      body: string;
    };
    personalDataCompany: {
      title: string;
      subtitle: string;
      body: string;
    };
  };
  languages: {
    [key: string]: {
      mainTitle: string;
      mainSubtitle: string;
      [key: string]: any;
    };
  };
}

const ADMIN_SETTING_KEY_TO_LABEL: Record<string, string> = {
  password: "비밀번호",
  mainTitle: "메인 제목",
  mainSubtitle: "서브 제목",
  applicationItem: "신청 항목",
  companyName: "상호명",
  ctaButtonText: "CTA 버튼",
  formTitle: "완료 페이지 제목",
  heroImageUrls: "히어로 이미지",
  profileImageUrl: "프로필 이미지",
  profileName: "프로필 이름",
  benefits: "혜택 항목",
  consentDetails: "개인정보 동의",
  languages: "언어 설정",
};

const ADMIN_SETTING_LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(ADMIN_SETTING_KEY_TO_LABEL).map(([key, label]) => [label, key])
);

/**
 * 구글 시트의 관리자설정 탭이 존재하는지 확인하고 없으면 생성
 */
export async function setupAdminSettingsSheet(): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const sheets = getSheetsClient();
    const sheetName = "관리자설정";

    // 시트 목록 조회
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (s) => s.properties?.title === sheetName
    );

    if (!sheetExists) {
      // 시트 생성
      const batchUpdateResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      const newSheetId = batchUpdateResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;

      // B 컬럼(값)을 먼저 텍스트 형식으로 설정
      if (newSheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: newSheetId,
                    startColumnIndex: 1,
                    endColumnIndex: 2,
                  },
                  cell: {
                    userEnteredFormat: {
                      numberFormat: {
                        type: "TEXT",
                      },
                    },
                  },
                  fields: "userEnteredFormat.numberFormat",
                },
              },
            ],
          },
        });
      }

      // 헤더 및 기본 데이터 추가 (작은따옴표로 텍스트 강제)
      const defaultSettings = [
        ["항목", "값"],
        [ADMIN_SETTING_KEY_TO_LABEL.password, "'0000"],
        [ADMIN_SETTING_KEY_TO_LABEL.mainTitle, "포토부스 체험단 모집"],
        [ADMIN_SETTING_KEY_TO_LABEL.mainSubtitle, "뜨거운 반응, 네컷사진 포토부스 실비렌탈"],
        [ADMIN_SETTING_KEY_TO_LABEL.applicationItem, "포토부스 렌탈"],
        [ADMIN_SETTING_KEY_TO_LABEL.companyName, "포토그루브"],
        [ADMIN_SETTING_KEY_TO_LABEL.ctaButtonText, "지금 신청하기"],
        [ADMIN_SETTING_KEY_TO_LABEL.formTitle, "신청이 완료 되었어요"],
        [ADMIN_SETTING_KEY_TO_LABEL.heroImageUrls, ""],
        [ADMIN_SETTING_KEY_TO_LABEL.profileImageUrl, ""],
        [ADMIN_SETTING_KEY_TO_LABEL.profileName, "포토그루브"],
        [ADMIN_SETTING_KEY_TO_LABEL.benefits, ""],
        [ADMIN_SETTING_KEY_TO_LABEL.consentDetails, ""],
        [ADMIN_SETTING_KEY_TO_LABEL.languages, ""],
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:B14`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: defaultSettings,
        },
      });

      console.log("[setupAdminSettingsSheet] Created admin settings sheet");
    } else {
      // 기존 시트가 있을 경우, 영어 키를 한글 라벨로 마이그레이션
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A2:A`,
        });

        const rows = response.data.values || [];
        for (let i = 0; i < rows.length; i++) {
          const currentKey = rows[i][0];
          const label = ADMIN_SETTING_KEY_TO_LABEL[currentKey];
          if (label && currentKey !== label) {
            const rowIndex = i + 2; // A2부터 시작
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${sheetName}!A${rowIndex}`,
              valueInputOption: "USER_ENTERED",
              requestBody: {
                values: [[label]],
              },
            });
          }
        }
      } catch (migrationError) {
        console.warn("[setupAdminSettingsSheet] Label migration failed:", migrationError);
      }
    }
  } catch (error: any) {
    console.error("[setupAdminSettingsSheet] Error:", error);
    throw error;
  }
}

/**
 * 관리자 설정값 조회
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const sheets = getSheetsClient();
    const sheetName = "관리자설정";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`,
    });

    if (!response.data.values || response.data.values.length < 2) {
      console.warn("[getAdminSettings] No data found");
      return null;
    }

    const rows = response.data.values;
    const settings: any = {};

    for (let i = 1; i < rows.length; i++) {
      const [rawKey, value] = rows[i];
      if (rawKey) {
        const key = ADMIN_SETTING_LABEL_TO_KEY[rawKey] || rawKey;
        // JSON 형태의 값 파싱
        try {
          settings[key] = value ? JSON.parse(value) : value;
        } catch {
          // JSON 파싱 실패 시 문자열로 저장
          settings[key] = value;
        }
      }
    }

    return settings as AdminSettings;
  } catch (error: any) {
    console.error("[getAdminSettings] Error:", error);
    return null;
  }
}

/**
 * 관리자 설정값 업데이트
 */
export async function updateAdminSetting(
  key: string,
  value: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const sheets = getSheetsClient();
    const sheetName = "관리자설정";

    // 현재 데이터 조회하여 행 번호 찾기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    let rowKey: string | undefined;
    const label = ADMIN_SETTING_KEY_TO_LABEL[key] || key;

    for (let i = 1; i < rows.length; i++) {
      const currentKey = rows[i][0];
      if (currentKey === key || currentKey === label) {
        rowIndex = i + 1; // 1-based index
        rowKey = currentKey;
        break;
      }
    }

    if (rowIndex === -1) {
      // 새로운 키인 경우 마지막에 추가
      rowIndex = rows.length + 1;
      rowKey = label;
    }

    const valueToStore = typeof value === "string" ? value : JSON.stringify(value);

    if (rowKey !== label) {
      // 영어 키가 남아있으면 한글 라벨로 교체
      rowKey = label;
    }

    if (rowKey === label && rows[rowIndex - 1]?.[0] !== label) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:B${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[rowKey, valueToStore]],
        },
      });
    } else {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!B${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[valueToStore]],
        },
      });
    }

    console.log(`[updateAdminSetting] Updated ${key}`);

    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[updateAdminSetting] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function deleteTimeSlots(
  slots: Array<{ date: string; time: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const sheets = getSheetsClient();
    const sheetName = "예약시간표";

    // 전체 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:D`,
    });

    const rows = response.data.values || [];
    const rowsToDelete: number[] = [];

    // 삭제할 행 찾기
    for (let i = 1; i < rows.length; i++) {
      const [date, time, capacity, bookedCount] = rows[i];
      
      // 예약이 이미 있는 경우 삭제 불가
      if (bookedCount && Number(bookedCount) > 0) continue;

      const matchingSlot = slots.find(
        (slot) => slot.date === date && slot.time === time
      );

      if (matchingSlot) {
        rowsToDelete.push(i + 1); // 1-based index
      }
    }

    if (rowsToDelete.length === 0) {
      return { success: true };
    }

    // 역순으로 삭제 (뒤에서부터 삭제해야 인덱스가 안 꼬임)
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) {
      throw new Error("Sheet not found");
    }

    const requests = rowsToDelete
      .sort((a, b) => b - a)
      .map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    console.log(`[deleteTimeSlots] Deleted ${rowsToDelete.length} slots`);

    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[deleteTimeSlots] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getAllTimeSlots(): Promise<{
  success: boolean;
  slots?: Array<{ date: string; time: string; capacity: number; bookedCount: number }>;
  error?: string;
}> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const sheets = getSheetsClient();
    const sheetName = "예약시간표";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:D`,
    });

    const rows = response.data.values || [];
    const slots = rows.slice(1).map((row) => {
      const [date, time, capacity, bookedCount] = row;
      return {
        date: date || "",
        time: time || "",
        capacity: Number(capacity) || 0,
        bookedCount: Number(bookedCount) || 0,
      };
    }).filter((slot) => slot.date && slot.time);

    return { success: true, slots };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[getAllTimeSlots] Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}