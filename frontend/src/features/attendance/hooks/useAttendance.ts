import { useState, useCallback } from "react";
import {
  getAttendance,
  submitAttendance,
  getAttendanceReport,
  type AttendanceRecord,
  type AttendanceReport,
  type ReportFilters,
} from "../api/attendanceApi";

export function useAttendance() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchAttendanceList = useCallback(async (groupClassId: number, date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAttendance(groupClassId, date);
      setAttendanceList(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar lista de asistencia");
      setAttendanceList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAttendance = async (groupClassId: number, date: string, records: { memberId: number; present: boolean }[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await submitAttendance({ groupClassId, date, records });
      // Refresh to confirm it was persisted
      await fetchAttendanceList(groupClassId, date);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al registrar asistencia");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReport = useCallback(async (filters: ReportFilters) => {
    setIsLoadingReport(true);
    setReportError(null);
    try {
      setReport(await getAttendanceReport(filters));
    } catch (err: any) {
      setReportError(err.message || "Error al cargar reportes de asistencia");
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  return {
    attendanceList,
    setAttendanceList,
    isLoading,
    error,
    fetchAttendanceList,
    saveAttendance,
    
    report,
    isLoadingReport,
    reportError,
    fetchReport,
  };
}
