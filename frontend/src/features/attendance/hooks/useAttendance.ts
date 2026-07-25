import { useState, useCallback } from "react";
import {
  getAttendance,
  submitAttendance,
  getAttendanceStats,
  type AttendanceRecord,
  type ClassStats,
} from "../api/attendanceApi";

export function useAttendance() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<ClassStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

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

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const data = await getAttendanceStats();
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message || "Error al cargar reportes de asistencia");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  return {
    attendanceList,
    setAttendanceList,
    isLoading,
    error,
    fetchAttendanceList,
    saveAttendance,
    
    stats,
    isLoadingStats,
    statsError,
    fetchStats,
  };
}
