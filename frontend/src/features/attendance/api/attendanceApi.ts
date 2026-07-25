import { apiFetch } from "@/lib/api";

export type AttendanceRecord = {
  memberId: number;
  firstName: string;
  lastName: string;
  dni: string;
  present: boolean;
  hasRecord: boolean;
};

export type RecordAttendanceInput = {
  groupClassId: number;
  date: string;
  records: { memberId: number; present: boolean }[];
};

export type ClassStats = {
  classId: number;
  disciplineName: string;
  professorName: string;
  schedule: string;
  days: string;
  enrolledCount: number;
  totalRecords: number;
  presentsCount: number;
  attendanceRate: number;
};

export async function getAttendance(groupClassId: number, date?: string): Promise<AttendanceRecord[]> {
  const queryDate = date ? `&date=${date}` : "";
  return apiFetch<AttendanceRecord[]>(`/api/attendance?groupClassId=${groupClassId}${queryDate}`);
}

export async function submitAttendance(payload: RecordAttendanceInput): Promise<any> {
  return apiFetch("/api/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAttendanceStats(): Promise<ClassStats[]> {
  return apiFetch<ClassStats[]>("/api/attendance/stats");
}
