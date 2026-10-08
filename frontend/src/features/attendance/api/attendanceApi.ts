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

export type ReportFilters = {
  from?: string;
  to?: string;
  disciplineId?: number;
  groupClassId?: number;
};

export type AttendanceReport = {
  summary: {
    totalRecords: number;
    totalPresents: number;
    attendanceRate: number;
    sessions: number;
    averagePerSession: number;
  };
  byDiscipline: {
    disciplineId: number;
    name: string;
    total: number;
    presents: number;
    sessions: number;
    attendanceRate: number;
    averagePerSession: number;
  }[];
  byClass: {
    classId: number;
    disciplineName: string;
    days: string;
    schedule: string;
    total: number;
    presents: number;
    sessions: number;
    attendanceRate: number;
  }[];
  byDay: { date: string; total: number; presents: number; attendanceRate: number }[];
  lowAttendanceMembers: {
    memberId: number;
    name: string;
    dni: string;
    total: number;
    presents: number;
    attendanceRate: number;
  }[];
};

export async function getAttendanceReport(filters: ReportFilters): Promise<AttendanceReport> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return apiFetch<AttendanceReport>(`/api/attendance/report${qs ? `?${qs}` : ""}`);
}
