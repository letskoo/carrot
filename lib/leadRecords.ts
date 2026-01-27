/**
 * 문의 레코드 저장 및 조회 (JSON 파일 기반)
 * 프로덕션에서는 SQLite/PostgreSQL로 변경 권장
 */

import fs from "fs";
import path from "path";

interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  region: string;
  message: string;
  createdAt: string; // ISO string
  userAgent?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const RECORDS_FILE = path.join(DATA_DIR, "leads.json");

/**
 * 데이터 디렉토리 초기화
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 레코드 파일 초기화
 */
function ensureRecordsFile() {
  ensureDataDir();
  if (!fs.existsSync(RECORDS_FILE)) {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * 모든 레코드 읽기
 */
export function getAllRecords(): LeadRecord[] {
  try {
    ensureRecordsFile();
    const data = fs.readFileSync(RECORDS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 새 레코드 저장
 */
export function saveRecord(data: {
  name: string;
  phone: string;
  region: string;
  message: string;
  createdAt: string;
  userAgent?: string;
}): LeadRecord {
  ensureRecordsFile();

  const records = getAllRecords();
  const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const record: LeadRecord = {
    id,
    name: data.name,
    phone: data.phone,
    region: data.region,
    message: data.message,
    createdAt: data.createdAt,
    userAgent: data.userAgent,
  };

  records.push(record);
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), "utf-8");

  return record;
}

/**
 * CSV 형식으로 변환
 */
export function convertToCSV(records: LeadRecord[]): string {
  if (records.length === 0) {
    return "ID,이름,연락처,지역,문의내용,접수일시\n";
  }

  const headers = ["ID", "이름", "연락처", "지역", "문의내용", "접수일시"];
  const rows = records.map((r) => [
    r.id,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.phone.replace(/"/g, '""')}"`,
    `"${(r.region || "-").replace(/"/g, '""')}"`,
    `"${r.message.replace(/"/g, '""').replace(/\n/g, "\\n")}"`,
    r.createdAt,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csv;
}
